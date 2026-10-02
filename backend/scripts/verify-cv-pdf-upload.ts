import "dotenv/config";
import assert from "node:assert/strict";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_PRIVATE_BUCKET_NAME } from "../src/utils/upload";
import { prisma } from "../src/utils/prisma";
import uploadService from "../src/services/upload.service";

function pdf() {
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>"];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(body)); body += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(body);
  body += "xref\n0 4\n0000000000 65535 f \n" + offsets.slice(1).map(offset => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  body += `trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body);
}
async function main() {
  const candidate = await prisma.candidate.findFirst({ where: { deletedAt: null, account: { role: "candidate", status: "active", deletedAt: null } }, select: { id: true, accountId: true } });
  assert.ok(candidate);
  const bytes = pdf();
  const upload = await uploadService.createUploadUrl(candidate.accountId, { purpose: "cv", fileName: "verification.pdf", fileSize: bytes.length, contentType: "application/pdf" });
  const originalTransaction = prisma.$transaction.bind(prisma);
  try {
    const cors = await fetch(upload.uploadUrl, { method: "OPTIONS", headers: { Origin: "http://localhost:3000", "Access-Control-Request-Method": "PUT", "Access-Control-Request-Headers": "content-type" } });
    assert.ok(cors.ok, "Storage CORS preflight");
    assert.ok(["*", "http://localhost:3000"].includes(cors.headers.get("access-control-allow-origin") ?? ""), "Frontend origin allowed by storage CORS");
    const put = await fetch(upload.uploadUrl, { method: "PUT", headers: { "Content-Type": "application/pdf" }, body: bytes });
    assert.equal(put.ok, true, "Presigned PDF upload");
    const rollback = new Error("ROLLBACK_PDF_TEST");
    try {
      await originalTransaction(async tx => {
        Object.assign(prisma, { $transaction: (callback: any) => callback(tx) });
        const input = { objectKey: upload.objectKey, title: "CV kiểm tra", isDefault: true };
        const cv = await uploadService.completeCvUpload(candidate.accountId, input);
        assert.equal(cv.fileKey, upload.objectKey);
        assert.equal(cv.contentJson, null);
        assert.equal(cv.isDefault, true);
        const retry = await uploadService.completeCvUpload(candidate.accountId, { objectKey: upload.objectKey, title: "CV kiểm tra" });
        assert.equal(retry.id, cv.id); assert.equal(retry.isDefault, true);
        assert.equal(await tx.cv.count({ where: { candidateId: candidate.id, deletedAt: null, isDefault: true } }), 1);
        await assert.rejects(() => uploadService.completeCvUpload("00000000-0000-4000-8000-000000000001", input));
        await tx.cv.update({ where: { id: cv.id }, data: { deletedAt: new Date() } });
        await assert.rejects(() => uploadService.completeCvUpload(candidate.accountId, input), (error: any) => error.code === "CV_DELETED");
        throw rollback;
      }, { timeout: 30000 });
    } catch (error) { if (error !== rollback) throw error; }
    Object.assign(prisma, { $transaction: originalTransaction });
    assert.equal(await prisma.cv.count({ where: { fileKey: upload.objectKey } }), 0);
    await r2Client.send(new PutObjectCommand({ Bucket: R2_PRIVATE_BUCKET_NAME, Key: upload.objectKey, ContentType: "application/pdf", Body: Buffer.from("fake PDF") }));
    await assert.rejects(() => uploadService.completeCvUpload(candidate.accountId, { objectKey: upload.objectKey, title: "CV kiểm tra" }), (error: any) => error.code === "INVALID_CV_FILE");
    console.log("PDF upload passed: real private storage PUT, fileKey, default CV, idempotent retry, ownership, deleted CV and fake PDF rejection. Database rolled back.");
  } finally {
    Object.assign(prisma, { $transaction: originalTransaction });
    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_PRIVATE_BUCKET_NAME, Key: upload.objectKey }));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
