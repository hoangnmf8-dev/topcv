import { AppError } from "@/exceptions";
import { httpRequest } from "@/lib/utils";

class LocationService {
  async getProvince() {
    try {
      const response = await httpRequest.get("/location/province");
      return response.data;
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
    };
  };
};
const locationService = new LocationService();
export default locationService;
