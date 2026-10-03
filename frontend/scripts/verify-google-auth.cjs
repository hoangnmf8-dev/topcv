const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const { NextRequest } = require("next/server");

function loadRoute(relative) {
  const filename = path.resolve(
    __dirname,
    "../src/app/api/auth/google",
    relative,
  );
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = mod.require.bind(mod);
  mod.require = (id) =>
    id === "@/constants/ttl.constant"
      ? { TTL: { ACCESS_TOKEN: 3600, REFRESH_TOKEN: 604800 } }
      : originalRequire(id);
  mod._compile(code, filename);
  return mod.exports.GET;
}

async function main() {
  const start = loadRoute("route.ts");
  const callback = loadRoute("callback/route.ts");
  const originalFetch = globalThis.fetch;
  try {
    let calls = 0;
    globalThis.fetch = async (url) => {
      calls++;
      assert.equal(new URL(url).searchParams.get("role"), "company");
      return Response.json({
        success: true,
        data: { url: "https://accounts.google.com/o/oauth2/v2/auth" },
      });
    };
    const initial = await start(
      new NextRequest("http://localhost:3000/api/auth/google?role=company"),
    );
    const state = initial.cookies.get("googleOAuthState").value;
    assert.match(state, /^[a-f0-9]{64}$/);
    assert.match(initial.headers.get("set-cookie"), /HttpOnly/);
    assert.equal(
      new URL(initial.headers.get("location")).hostname,
      "accounts.google.com",
    );
    const request = (query, cookie = state) =>
      new NextRequest(
        `http://localhost:3000/api/auth/google/callback?${query}`,
        { headers: { cookie: `googleOAuthState=${cookie}` } },
      );
    const invalid = await callback(
      request(`state=${state}&code=code`, "b".repeat(64)),
    );
    assert.match(invalid.headers.get("location"), /google_failed/);
    assert.equal(calls, 1, "Invalid browser state must not call backend");
    const cancelled = await callback(
      request(`state=${state}&error=access_denied`),
    );
    assert.match(cancelled.headers.get("location"), /google_cancelled/);
    globalThis.fetch = async () =>
      Response.json({
        success: true,
        data: {
          accessToken: "access",
          refreshToken: "refresh",
          role: "company",
        },
      });
    const success = await callback(request(`state=${state}&code=code`));
    assert.equal(
      new URL(success.headers.get("location")).pathname,
      "/employer",
    );
    assert.equal(success.cookies.get("accessToken").value, "access");
    assert.equal(success.cookies.get("refreshToken").value, "refresh");
    assert.equal(success.cookies.get("googleOAuthState").value, "");
    assert.match(success.headers.get("set-cookie"), /HttpOnly/);
    globalThis.fetch = async () =>
      Response.json({ success: false }, { status: 403 });
    const denied = await callback(request(`state=${state}&code=code`));
    assert.match(denied.headers.get("location"), /google_failed/);
    assert.equal(denied.cookies.get("accessToken"), undefined);
    console.log(
      "Google frontend checks passed: redirect, browser state, cancellation, session cookies, backend failure.",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
