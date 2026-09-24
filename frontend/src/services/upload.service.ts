import { AppError } from "@/exceptions";
import { httpRequest } from "@/lib/utils";

class UpLoadService {
  async getPresignedUrl(file: File, purpose: string) {
    const response = await httpRequest.post("/upload/presign", {
      purpose: purpose,
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    });
    const data = await response.data;
    return data;
  }
  async uploadFile(uploadUrl: string, file: File) {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail);
    }
    return true;
  }
  async completeUploadFile(purpose: string, objectKey: string) {
    const response = await httpRequest.post("/upload/completed", {
      purpose,
      objectKey,
    });
    return response.data;
  }
  async getUrlFile(objectKey: string) {
    const domain = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/+$/, "");
    if (
      domain &&
      /^seed\/topcv\/(companies|candidates)\/[^/]+\/(logo|banner|avatar)[^/]*\.(png|jpe?g|webp)$/i.test(
        objectKey,
      )
    ) {
      return (
        domain + "/" + objectKey.split("/").map(encodeURIComponent).join("/")
      );
    }
    const response = await httpRequest.post("/upload/presign-dowload", {
      objectKey,
    });
    return response.data.data as string;
  }
}
const uploadService = new UpLoadService();
export default uploadService;
