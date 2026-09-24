import type { Request, Response, NextFunction } from "express";
import locationService from "../services/location.service";
import { successResponse } from "../utils/response";

class LocationController {
  async getProvice(req: Request, res: Response, next: NextFunction) {
    try {
      const provinces = await locationService.getProvince();
      return successResponse(res, provinces, "Lấy thông tin tỉnh/thành thành công");
    } catch(error) {
      next(error);
    }
  }
};
const locationController = new LocationController();
export default locationController;