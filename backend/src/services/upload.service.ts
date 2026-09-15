import { uuidv7 } from "uuidv7";
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME } from "../utils/upload";
import type { PresignUploadInput, UploadPurpose } from "../types/upload.type";
import { UPLOAD } from "../constants/upload.constant";

class UploadService {
  private uploadRules: Record<
    UploadPurpose,
    {
      folder: string;
      allowedTypes: readonly string[];
      maxSize: number;
    }
  > = {
    avatar: {
      folder: "avatars",
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      maxSize: 5 * UPLOAD.FILE_SIZE,
    },

    companyLogo: {
      folder: "company-logos",
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      maxSize: 5 * UPLOAD.FILE_SIZE,
    },

    companyBanner: {
      folder: "company-banners",
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      maxSize: 10 * UPLOAD.FILE_SIZE,
    },

    cv: {
      folder: "cvs",
      allowedTypes: ["application/pdf"],
      maxSize: 10 * UPLOAD.FILE_SIZE,
    },
  };
  getFileExtension(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase(); //kiểm tra đuôi file
    if (!extension || !/^[a-z0-9]+$/.test(extension)) {
      throw new Error("Tên file không hợp lệ");
    }
    return extension;
  }

  validateFile(input: PresignUploadInput): void {
    const rule = this.uploadRules[input.purpose];
    if (!rule.allowedTypes.includes(input.contentType)) {
      throw new Error("Định dạng file không được hỗ trợ");
    }
    if (input.fileSize > rule.maxSize) {
      throw new Error("Dung lượng file vượt quá giới hạn");
    }
  };
  async createUploadUrl(accountId: string, input: PresignUploadInput) {
    this.validateFile(input); 
    const rule = this.uploadRules[input.purpose];
    const extension = this.getFileExtension(input.fileName);
    const objectKey = `${rule.folder}/${accountId}/${uuidv7()}.${extension}`; 
    const command = new PutObjectCommand({ 
      Bucket: R2_BUCKET_NAME,
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
  };
  async assertFileExists(objectKey: string): Promise<void> { //Kiểm tra client đã tải file lên r2 chưa
    await r2Client.send(
      new HeadObjectCommand({ //lệnh lấy metadata của file để kiểm tra tồn tại, k tải toàn bộ thông tin file
        Bucket: R2_BUCKET_NAME,
        Key: objectKey,
      }),
    );
  };
  async createDownloadUrl(objectKey: string): Promise<string> { //Tạo link để xem hoặc tải file
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
    });
    return getSignedUrl(r2Client, command, { expiresIn: 300 });
  };
};
const uploadService = new UploadService();
export default uploadService;
