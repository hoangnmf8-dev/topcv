import "dotenv/config";
import assert from "node:assert/strict";
import { calculateProfileCompletion, ProfileCompletionService } from "../src/services/profile-completion.service";
import { prisma } from "../src/utils/prisma";
import jwtService from "../src/services/jwt.service";
const empty = { fullName: "", avatarKey: null, phone: null, headline: null, experienceYears: null, address: null, careerGoal: null };
assert.equal(calculateProfileCompletion(empty, []).percentage, 0);
const complete = { fullName: "Nguyễn An", avatarKey: "avatar/key", phone: "0912345678", headline: "Lập trình viên", experienceYears: 0, address: "Hà Nội", careerGoal: "Phát triển sản phẩm phần mềm" };
assert.equal(calculateProfileCompletion(complete, []).percentage, 70);
const cv = { fileKey: "cv/file.pdf", contentJson: null, deletedAt: null };
assert.equal(calculateProfileCompletion(complete, [cv]).percentage, 100);
assert.equal(calculateProfileCompletion(complete, [cv, cv]).percentage, 100);
assert.equal(calculateProfileCompletion(complete, [{ ...cv, deletedAt: new Date() }]).percentage, 70);
assert.equal(calculateProfileCompletion(complete, [{ ...cv, fileKey: null, contentJson: {} }]).percentage, 70);
for (const key of Object.keys(empty)) {
  assert.equal(calculateProfileCompletion({ ...complete, [key]: empty[key as keyof typeof empty] }, [cv]).percentage, 90, `${key} contributes 10%`);
}
assert.equal(calculateProfileCompletion({ ...complete, phone: "invalid" }, []).percentage, 60);
async function main() {
  const candidate = await prisma.candidate.findFirst({ where: { deletedAt: null, account: { status: "active", deletedAt: null, role: "candidate" } }, select: { accountId: true } });
  assert.ok(candidate);
  const score = await new ProfileCompletionService().get(candidate.accountId);
  assert.equal(score.items.reduce((sum, item) => sum + item.points, 0), 100);
  assert.ok(score.percentage >= 0 && score.percentage <= 100);
  if (process.argv.includes("--http")) {
    const token = jwtService.createAccessToken(candidate.accountId, "candidate");
    const get = async (path: string) => {
      const response = await fetch(`http://localhost:3100${path}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) });
      assert.equal(response.status, 200, path);
      return response.json();
    };
    const completion = await get("/candidate/me/completion");
    const overview = await get("/candidate/me/overview");
    const profile = await get("/auth/profile");
    assert.equal(completion.data.percentage, score.percentage);
    assert.equal(overview.profileCompletion, score.percentage);
    assert.equal(profile.data.candidate.profileCompletion, score.percentage);
    console.log("Live API completion/overview/profile agree.");
  }
  console.log("Profile completion passed: seven fields × 10%, CV 30%, zero experience, invalid/deleted/duplicate CV, existing profile. No database writes.");
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
