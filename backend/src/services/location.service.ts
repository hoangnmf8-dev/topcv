import { prisma } from "../utils/prisma";

class LocationService {
  async getWards(provinceId: string) {
    return prisma.ward.findMany({ where: { provinceId }, select: { id: true, provinceId: true, code: true, fullName: true }, orderBy: { fullName: "asc" } });
  }
  async getProvince() {
    return await prisma.province.findMany();
  };
  async getDetailProvince(id: string) {
    return prisma.province.findUnique({
      where: {
        id
      }
    })
  }
};
const locationService = new LocationService();
export default locationService;