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
      // const input = completeUploadSchema.parse(req.body);
      // switch (input.purpose) {
      //   case "cv":
      //     return completeCvUpload(accountId, input, res);
      //   case "avatar":
      //     return completeAvatarUpload(accountId, input.objectKey, res);
      //   case "companyLogo":
      //     return completeCompanyImageUpload(
      //       accountId,
      //       input.objectKey,
      //       "logo",
      //       res,
      //     );
      //   case "companyBanner":
      //     return completeCompanyImageUpload(
      //       accountId,
      //       input.objectKey,
      //       "banner",
      //       res,
      //     );
      // }
    } catch (error) {
      next(error);
    }
  }
}
const uploadController = new UploadController();
export default uploadController;
