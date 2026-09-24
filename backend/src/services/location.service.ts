import { prisma } from "../utils/prisma";

class LocationService {
  async getProvince() {
    return await prisma.province.findMany();
  }
};
const locationService = new LocationService();
export default locationService;