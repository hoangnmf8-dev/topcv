import { uuidv7 } from "uuidv7";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  r2Client,
  R2_PUBLIC_BUCKET_NAME,
  R2_PRIVATE_BUCKET_NAME,
  publicImageUrl,
} from "../utils/upload";
import type { PresignUploadInput, UploadPurpose } from "../types/upload.type";
import { UPLOAD } from "../constants/upload.constant";
import { prisma } from "../utils/prisma";
import { AccountNotFoundError } from "../exceptions";
import { ERROR_MESSAGE } from "../constants/message.constant";
import { ERROR_CODE } from "../constants/code.constant";
import { AppError } from "../exceptions";

const UUID_V7_PATTERN =
  "[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

class UploadService {
  private readonly extensionByContentType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };
  private uploadRules: Record<
    UploadPurpose,
    {
      folder: string;
      allowedTypes: readonly string[];
      maxSize: number;
      name: string;
    }
  > = {
    avatar: {
      folder: "candidates",
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      maxSize: UPLOAD.IMAGE_SIZE,
      name: "avatar",
    },
    companyLogo: {
      folder: "companies",
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      maxSize: UPLOAD.IMAGE_SIZE,
      name: "logo",
    },
    companyBanner: {
      folder: "companies",
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      maxSize: UPLOAD.IMAGE_SIZE,
      name: "banner",
    },
    cvImage: {
      folder: "candidates",
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      maxSize: UPLOAD.IMAGE_SIZE,
      name: "cv-image",
    },
    cv: {
      folder: "candidates",
      allowedTypes: ["application/pdf"],
      maxSize: UPLOAD.CV_SIZE,
      name: "cv",
    },
  };
  private getFileExtension(contentType: string): string {
    const extension = this.extensionByContentType[contentType];
    if (!extension) throw new Error("Định dạng file không được hỗ trợ");
    return extension;
  }

  private isExpectedObjectKey(
    accountId: string,
    purpose: UploadPurpose,
    objectKey: string,
  ): boolean {
    const rule = this.uploadRules[purpose];
    const extensionPattern = purpose === "cv" ? "pdf" : "jpg|png|webp";
    const escapedAccountId = accountId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      `^seed/topcv/${rule.folder}/${escapedAccountId}/${rule.name}-${UUID_V7_PATTERN}\\.(${extensionPattern})$`,
      "i",
    );

    return pattern.test(objectKey);
  }
  validateFile(input: PresignUploadInput): void {
    const rule = this.uploadRules[input.purpose];
    if (!rule.allowedTypes.includes(input.contentType)) {
      throw new Error("Định dạng file không được hỗ trợ");
    }
    if (input.fileSize > rule.maxSize) {
      throw new Error("Dung lượng file vượt quá giới hạn");
    }
  }
  async createUploadUrl(accountId: string, input: PresignUploadInput) {
    if (input.purpose === "cvImage") {
      const candidate = await prisma.candidate.findFirst({
        where: {
          accountId,
          deletedAt: null,
          account: { status: "active", deletedAt: null },
        },
      });
      if (!candidate)
        throw new AppError("Không có quyền tải ảnh CV", "FORBIDDEN", 403);
    }
    this.validateFile(input);
    const rule = this.uploadRules[input.purpose];
    const extension = this.getFileExtension(input.contentType);
    const objectKey = `seed/topcv/${rule.folder}/${accountId}/${rule.name}-${uuidv7()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: ["cv", "cvImage"].includes(input.purpose)
        ? R2_PRIVATE_BUCKET_NAME
        : R2_PUBLIC_BUCKET_NAME,
      Key: objectKey,
      ContentType: input.contentType,
    });
    const expiresIn = UPLOAD.EXPIRE_IN;
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn }); //Tạo presignUrl
    return {
      objectKey,
      uploadUrl,
      expiresIn,
    };
  }
  async validateCvImage(accountId: string, objectKey: string) {
    if (!this.isExpectedObjectKey(accountId, "cvImage", objectKey))
      throw new AppError(
        "Ảnh CV không thuộc tài khoản",
        "INVALID_CV_IMAGE",
        400,
      );
    const meta = await r2Client.send(
      new HeadObjectCommand({ Bucket: R2_PRIVATE_BUCKET_NAME, Key: objectKey }),
    );
    if (
      !this.uploadRules.cvImage.allowedTypes.includes(meta.ContentType ?? "") ||
      !meta.ContentLength ||
      meta.ContentLength > UPLOAD.IMAGE_SIZE
    )
      throw new AppError("Ảnh CV không hợp lệ", "INVALID_CV_IMAGE", 400);
  }
  async cvImageUrl(objectKey: string) {
    return getSignedUrl(
      r2Client,
      new GetObjectCommand({ Bucket: R2_PRIVATE_BUCKET_NAME, Key: objectKey }),
      { expiresIn: 3600 },
    );
  }
  async assertFileExists(objectKey: string): Promise<void> {
    await r2Client.send(
      new HeadObjectCommand({
        Bucket: R2_PUBLIC_BUCKET_NAME,
        Key: objectKey,
      }),
    );
  }
  async deleteFileExists(objectKey: string): Promise<void> {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_PUBLIC_BUCKET_NAME,
        Key: objectKey,
      }),
    );
  }
  async createImageUrl(objectKey: string): Promise<string> {
    if (
      !/^seed\/topcv\/(companies|candidates)\/[^/]+\/(logo|banner|avatar)[^/]*\.(png|jpe?g|webp)$/i.test(
        objectKey,
      )
    ) {
      throw new AppError("Key ảnh không hợp lệ", "INVALID_IMAGE_KEY", 400);
    }
    return (
      publicImageUrl(objectKey) ??
      getSignedUrl(
        r2Client,
        new GetObjectCommand({ Bucket: R2_PUBLIC_BUCKET_NAME, Key: objectKey }),
        { expiresIn: 3600 },
      )
    );
  }
  async createDownloadUrl(
    objectKey: string,
    accountId: string,
  ): Promise<string> {
    if (/\.(png|jpe?g|webp)$/i.test(objectKey))
      return this.createImageUrl(objectKey);
    const cv = await prisma.cv.findFirst({
      where: {
        fileKey: objectKey,
        deletedAt: null,
        OR: [
          { candidate: { accountId, deletedAt: null } },
          {
            applications: {
              some: {
                deletedAt: null,
                jobPost: {
                  deletedAt: null,
                  company: { accountId, deletedAt: null },
                },
              },
            },
          },
        ],
      },
      select: { fileKey: true },
    });
    if (!cv?.fileKey)
      throw new AppError("Không có quyền xem CV", "CV_ACCESS_DENIED", 403);
    return getSignedUrl(
      r2Client,
      new GetObjectCommand({ Bucket: R2_PRIVATE_BUCKET_NAME, Key: cv.fileKey }),
      { expiresIn: 300 },
    );
  }
  async completeCvUpload(
    accountId: string,
    input: { objectKey: string; title: string; isDefault?: boolean },
  ) {
    if (!this.isExpectedObjectKey(accountId, "cv", input.objectKey)) {
      throw new AppError("Key CV không hợp lệ", "INVALID_CV_KEY", 400);
    }
    const candidate = await prisma.candidate.findFirst({
      where: { accountId, deletedAt: null },
      select: { id: true },
    });
    if (!candidate)
      throw new AppError("Không tìm thấy ứng viên", "CANDIDATE_NOT_FOUND", 404);
    const metadata = await r2Client.send(
      new HeadObjectCommand({
        Bucket: R2_PRIVATE_BUCKET_NAME,
        Key: input.objectKey,
      }),
    );
    if (
      metadata.ContentType !== "application/pdf" ||
      !metadata.ContentLength ||
      metadata.ContentLength > this.uploadRules.cv.maxSize
    ) {
      throw new AppError("File CV không hợp lệ", "INVALID_CV_FILE", 400);
    }
    return prisma.$transaction(async (tx) => {
      if (input.isDefault)
        await tx.cv.updateMany({
          where: { candidateId: candidate.id, isDefault: true },
          data: { isDefault: false },
        });
      const existing = await tx.cv.findFirst({
        where: {
          candidateId: candidate.id,
          fileKey: input.objectKey,
          deletedAt: null,
        },
      });
      const data = { title: input.title, isDefault: input.isDefault ?? false };
      return existing
        ? tx.cv.update({ where: { id: existing.id }, data })
        : tx.cv.create({
            data: {
              ...data,
              candidateId: candidate.id,
              fileKey: input.objectKey,
            },
          });
    });
  }
  async completeAvatarUpload(
    accountId: string,
    purpose: "avatar",
    objectKey: string,
  ) {
    const candidate = await prisma.candidate.findUnique({
      where: { accountId },
      select: {
        id: true,
        avatarKey: true,
      },
    });
    if (!candidate) {
      throw new AccountNotFoundError(
        ERROR_CODE.ACCOUNT_NOT_FOUND,
        ERROR_MESSAGE.ACCOUNT_NOT_FOUND,
      );
    }
    const rule = this.uploadRules[purpose];
    if (!this.isExpectedObjectKey(accountId, purpose, objectKey)) {
      throw new Error("File không thuộc tài khoản hoặc sai mục đích upload");
    }
    const metadata = await r2Client.send(
      new HeadObjectCommand({
        Bucket: R2_PUBLIC_BUCKET_NAME,
        Key: objectKey,
      }),
    );
    const contentType = metadata.ContentType ?? "";
    const fileSize = metadata.ContentLength ?? 0;
    if (!rule.allowedTypes.includes(contentType)) {
      await this.deleteFileExists(objectKey);
      throw new Error("Định dạng file không hợp lệ");
    }
    if (fileSize <= 0 || fileSize > rule.maxSize) {
      await this.deleteFileExists(objectKey);
      throw new Error("Dung lượng file không hợp lệ");
    }
    //Xóa ảnh cũ trên r2 và cập nhật lại objectKey trong csdl
    this.deleteFileExists(candidate.avatarKey!);
    const imageUrl = await this.createImageUrl(objectKey);
    await prisma.candidate.update({
      where: { accountId },
      data: {
        avatarKey: objectKey,
      },
    });
    return {
      purpose,
      objectKey,
      imageUrl,
    };
  }
  async completeCompanyImageUpload(
    accountId: string,
    purpose: "companyLogo" | "companyBanner",
    objectKey: string,
  ) {
    const company = await prisma.company.findUnique({
      where: { accountId },
      select: {
        id: true,
        logoKey: true,
        bannerKey: true,
      },
    });
    if (!company) {
      throw new AccountNotFoundError(
        ERROR_CODE.ACCOUNT_NOT_FOUND,
        ERROR_MESSAGE.ACCOUNT_NOT_FOUND,
      );
    }
    const rule = this.uploadRules[purpose];
    if (!this.isExpectedObjectKey(accountId, purpose, objectKey)) {
      throw new Error("File không thuộc tài khoản hoặc sai mục đích upload");
    }
    const metadata = await r2Client.send(
      new HeadObjectCommand({
        Bucket: R2_PUBLIC_BUCKET_NAME,
        Key: objectKey,
      }),
    );
    const contentType = metadata.ContentType ?? "";
    const fileSize = metadata.ContentLength ?? 0;
    if (!rule.allowedTypes.includes(contentType)) {
      await this.deleteFileExists(objectKey);
      throw new Error("Định dạng file không hợp lệ");
    }
    if (fileSize <= 0 || fileSize > rule.maxSize) {
      await this.deleteFileExists(objectKey);
      throw new Error("Dung lượng file không hợp lệ");
    }
    // Tạo URL đọc ảnh để trả lại cho frontend.
    const imageUrl = await this.createImageUrl(objectKey);

    await prisma.company.update({
      where: { accountId },
      data:
        purpose === "companyLogo"
          ? { logoKey: objectKey }
          : { bannerKey: objectKey },
    });
    return {
      purpose,
      objectKey,
      imageUrl,
    };
  }
}
const uploadService = new UploadService();
export default uploadService;
