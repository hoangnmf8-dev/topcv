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
    try {
      const response = await httpRequest.post("/upload/presign-dowload", {
        objectKey,
      });
      return response.data.data;
    } catch (error) {
      if (error instanceof AppError) {
        return {
          success: false,
          status: error.status,
          message: error.message,
          code: error.code,
        };
      }
      return {
        success: false,
        status: 500,
        message: "Đã xảy ra lỗi",
      };
    }
  }
}
const uploadService = new UpLoadService();
export default uploadService;
