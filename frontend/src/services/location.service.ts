import { httpRequest } from "@/lib/utils";
import type { Provice } from "@/types";
export type Ward = { id: string; provinceId: string; code: string; fullName: string };
class LocationService {
  async getWards(provinceId: string, signal?: AbortSignal): Promise<Ward[]> {
    const response = await httpRequest.get<{ success: boolean; data: Ward[] }>("/location/province/" + encodeURIComponent(provinceId) + "/wards", { signal });
    if (!response.data.success || !Array.isArray(response.data.data)) throw new Error("Không thể tải phường/xã");
    return response.data.data;
  }
  async getProvince(signal?: AbortSignal) {
    const response = await httpRequest.get<{ success: boolean; data: Provice[] }>("/location/province", { signal });
    if (!response.data.success || !Array.isArray(response.data.data)) throw new Error("Không thể tải địa điểm");
    return response.data;
  }
}
export default new LocationService();
