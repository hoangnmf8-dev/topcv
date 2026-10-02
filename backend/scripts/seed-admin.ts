import "dotenv/config";
import { randomBytes } from "node:crypto";
import { prisma } from "../src/utils/prisma";
import { hashString } from "../src/utils/hashing";

async function seed() {
  const email = "admin@gmail.com";
  const existing = await prisma.account.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "admin" || existing.deletedAt || existing.status !== "active") throw new Error("Email đã tồn tại, không tự thay đổi quyền tài khoản");
    console.log("Admin giả lập đã tồn tại:", email);
    return;
  }
  const password = `Demo!${randomBytes(9).toString("base64url")}9a`;
  await prisma.account.create({ data: { email, passwordHash: hashString(password), role: "admin", status: "active", verifyEmail: true } });
  console.log(JSON.stringify({ email, password }));
}
seed().finally(() => prisma.$disconnect());
