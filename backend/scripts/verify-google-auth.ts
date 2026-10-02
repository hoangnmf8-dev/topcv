import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import googleAuthService from "../src/services/google-auth.service";
import { googleStartSchema, googleCallbackSchema } from "../src/validators/google-auth.validate";
import authService from "../src/services/auth.service";
import { redisClient } from "../src/utils/redis";
import { prisma } from "../src/utils/prisma";

async function main() {
  const originalFetch = globalThis.fetch;
  const originalAuth = authService.authGoogle;
  const states: string[] = [];
  try {
    if (!redisClient.isReady) await new Promise<void>((resolve) => redisClient.once("ready", resolve));
    assert.equal(googleStartSchema.safeParse({ role: "admin", state: "a".repeat(64) }).success, false);
    assert.equal(googleCallbackSchema.safeParse({ state: "bad", code: "code" }).success, false);
    const state = randomBytes(32).toString("hex"); states.push(state);
    const started = await googleAuthService.start({ role: "company", state });
    const url = new URL(started.url);
    assert.equal(url.hostname, "accounts.google.com");
    assert.equal(url.searchParams.get("state"), state);
    assert.equal(url.searchParams.get("code_challenge_method"), "S256");
    await assert.rejects(() => googleAuthService.start({ role: "candidate", state }));
    let calls = 0;
    globalThis.fetch = async (url, init) => {
      calls++;
      if (String(url).includes("/token")) {
        assert.equal((init?.headers as Record<string, string>)["Content-Type"], "application/x-www-form-urlencoded");
        assert.ok((init?.body as URLSearchParams).get("code_verifier"));
        return Response.json({ access_token: "google-test-token" });
      }
      return Response.json({ sub: "subject-1", email: "person@gmail.com", email_verified: true, name: "Nguyễn An" });
    };
    authService.authGoogle = async (email, name, role, authoritative) => {
      assert.equal(email, "person@gmail.com"); assert.equal(role, "company"); assert.equal(authoritative, true);
      return { accessToken: "access", refreshToken: "refresh", role };
    };
    assert.equal((await googleAuthService.callback({ code: "code", state })).role, "company");
    assert.equal(calls, 2);
    await assert.rejects(() => googleAuthService.callback({ code: "code", state }));
    assert.equal(calls, 2);
    const unverified = randomBytes(32).toString("hex"); states.push(unverified);
    await googleAuthService.start({ role: "candidate", state: unverified });
    globalThis.fetch = async (url) => Response.json(String(url).includes("/token") ? { access_token: "token" } : { sub: "subject", email: "person@gmail.com", email_verified: false });
    await assert.rejects(() => googleAuthService.callback({ code: "code", state: unverified }));
    authService.authGoogle = originalAuth;
    const originalTransaction = prisma.$transaction;
    const originalSave = authService.saveRefreshToken;
    let existing: any = null;
    let created: any;
    Object.assign(prisma, { $transaction: async (callback: any) => callback({ account: {
      findUnique: async ({ where }: any) => where.googleSubject ? (existing?.googleSubject === where.googleSubject ? existing : null) : existing,
      update: async ({ data }: any) => ({ ...existing, ...data }),
      create: async ({ data }: any) => { created = data; return { id: "account-id", ...data }; },
    } }) });
    authService.saveRefreshToken = async () => {};
    try {
      await authService.authGoogle("person@gmail.com", "Nguyễn An", "candidate", true, "subject-1");
      assert.equal(created.verifyEmail, true);
      assert.equal(created.candidate.create.fullName, "Nguyễn An");
      assert.ok(created.passwordHash.startsWith("$2"));
      await authService.authGoogle("person@gmail.com", "Nguyễn An", "company", true, "subject-1");
      assert.ok(created.company.create.code);
      existing = { id: "account-id", role: "company", status: "active", deletedAt: null };
      assert.equal((await authService.authGoogle("person@gmail.com", "Nguyễn An", "candidate", true, "subject-1")).role, "company");
      await assert.rejects(() => authService.authGoogle("person@example.com", "Nguyễn An", "candidate", false, "subject-1"));
      existing.googleSubject = "subject-1";
      assert.equal((await authService.authGoogle("person@example.com", "Nguyễn An", "candidate", false, "subject-1")).role, "company");
      existing.status = "blocked";
      await assert.rejects(() => authService.authGoogle("person@gmail.com", "Nguyễn An", "candidate", true, "subject-1"));
      existing.status = "active"; existing.deletedAt = new Date();
      await assert.rejects(() => authService.authGoogle("person@gmail.com", "Nguyễn An", "candidate", true, "subject-1"));
    } finally {
      Object.assign(prisma, { $transaction: originalTransaction });
      authService.saveRefreshToken = originalSave;
    }
    console.log("Google OAuth checks passed: validation, PKCE, role, state reuse, verified email. No database changes.");
  } finally {
    globalThis.fetch = originalFetch; authService.authGoogle = originalAuth;
    await Promise.all(states.map((state) => redisClient.del(`oauth2:${state}`)));
  }
}
main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
