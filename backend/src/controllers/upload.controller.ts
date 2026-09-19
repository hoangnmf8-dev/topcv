import type { Request, Response, NextFunction } from "express";
import uploadService from "../services/upload.service";
import { successResponse } from "../utils/response";

class UploadController {
  async presignUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body;
      const accountId = req.profile.id;
      const result = await uploadService.createUploadUrl(accountId, input);
      return successResponse(res, result, "Tải file thành công");
    } catch (error) {
      next(error);
    }
  }
  async uploadCompleted(req: Request, res: Response, next: NextFunction) {
    try {
      const accountId = req.profile.id;
      const input = req.body;
      switch (input.purpose) {
        // case "cv":
        //   return completeCvUpload(accountId, input, res);
        case "avatar":
          const avatarResponse = await uploadService.completeAvatarUpload(
            accountId,
            "avatar",
            input.objectKey,
          );
          return successResponse(res, avatarResponse, "Tải ảnh thành công", 201);
        case "companyLogo":
          const logoReponse = await uploadService.completeCompanyImageUpload(
            accountId,
            "companyLogo",
            input.objectKey,
          );
          return successResponse(res, logoReponse, "Tải ảnh thành công", 201);
        case "companyBanner":
          const bannerResponse = await uploadService.completeCompanyImageUpload(
            accountId,
            "companyBanner",
            input.objectKey,
          );
          return successResponse(res, bannerResponse, "Tải ảnh thành công", 201);
      }
    } catch (error) {
      next(error);
    }
  }
  async getPresidnedDowload(req: Request, res: Response, next: NextFunction) {
    try {
      const {objectKey} = req.body;
      const presignedUpload = await uploadService.createDownloadUrl(objectKey);
      return successResponse(res, presignedUpload, "Lấy đường dẫn ảnh thành công");
    } catch(error) {
      next(error);
    }
  };
}
const uploadController = new UploadController();
export default uploadController;
