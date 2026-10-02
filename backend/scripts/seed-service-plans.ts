import "dotenv/config";
import { syncPlans } from "../src/services/billing.service";
import { prisma } from "../src/utils/prisma";
syncPlans()
  .then(() => console.log("Service plans updated"))
  .finally(() => prisma.$disconnect());
