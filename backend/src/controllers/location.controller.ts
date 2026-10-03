import type { Request, Response, NextFunction } from "express";
import locationService from "../services/location.service";
import { successResponse } from "../utils/response";

class LocationController {
  async getWards(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id,
        )
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Tỉnh/thành không hợp lệ" });
      }
      return successResponse(
        res,
        await locationService.getWards(id),
        "Lấy phường/xã thành công",
      );
    } catch (error) {
      next(error);
    }
  }
  async getProvice(req: Request, res: Response, next: NextFunction) {
    try {
      const provinces = await locationService.getProvince();
      return successResponse(
        res,
        provinces,
        "Lấy thông tin tỉnh/thành thành công",
      );
    } catch (error) {
      next(error);
    }
  }
  async getDetailProvice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as unknown as string;
      const province = await locationService.getDetailProvince(id);
      return successResponse(
        res,
        province,
        "Lấy thông tin tỉnh/thành thành công",
      );
    } catch (error) {
      next(error);
    }
  }
}
const locationController = new LocationController();
export default locationController;
