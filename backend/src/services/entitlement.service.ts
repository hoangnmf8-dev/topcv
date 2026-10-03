import { prisma } from "../utils/prisma";
import type { Prisma } from "../generated/prisma/client";
import { AppError } from "../exceptions";

export async function planEntitlements(
  planId: string,
  db: Prisma.TransactionClient = prisma,
) {
  const rows = await db.planEntitlement.findMany({
    where: { planId },
    include: { entitlement: true },
  });
  const values: Record<string, Prisma.JsonValue> = {};
  for (const row of rows) {
    const type = row.entitlement.valueType;
    if (
      typeof row.value !== type ||
      (type === "number" &&
        (!Number.isInteger(row.value) || Number(row.value) < 0))
    )
      throw new AppError(
        `Quyền lợi ${row.entitlement.code} không hợp lệ`,
        "INVALID_PLAN",
        409,
      );
    values[row.entitlement.code] = row.value;
  }
  return values;
}
