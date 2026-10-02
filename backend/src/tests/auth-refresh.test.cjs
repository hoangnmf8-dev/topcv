require('dotenv').config({ quiet: true });
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('../../../frontend/node_modules/typescript');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');
const { createClient } = require('redis');
function load(file, dependencies, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, require: id => dependencies[id] ?? {}, process, Date, JSON, ...globals });
  return exports;
}
test('refresh authentication and concurrent rotation with isolated Redis fixtures', async t => {
  const redis = createClient({ url: process.env.REDIS_URL });
  await redis.connect();
  const id = randomUUID(), secret = randomUUID(), keys = [];
  let active = true;
  const sign = (key, expiresIn = '1h') => jwt.sign({ accountId: id, role: 'candidate', jti: randomUUID() }, key, { expiresIn });
  class Unauthorized extends Error { constructor() { super('invalid'); this.status = 401; } }
  const helper = load('src/services/refresh-session.ts', { 'node:crypto': require('node:crypto') });
  const auth = load('src/services/auth.service.ts', {
    '../exceptions': { Unauthorized },
    '../utils/prisma': { prisma: { account: { findFirst: async () => active ? { id, role: 'candidate' } : null } } },
    '../utils/redis': { redisClient: redis },
    './jwt.service': { default: { verifyRefreshToken: token => jwt.verify(token, secret), decodeToken: token => jwt.decode(token), createAccessToken: () => sign(secret), createRefreshToken: () => sign(secret, '7d') } },
    '../constants/message.constant': { ERROR_MESSAGE: { AUTH_SERVICE: {} } },
    '../constants/code.constant': { ERROR_CODE: { AUTH_SERVICE: {} } },
    './refresh-session': helper,
  }).default;
  const seed = async () => {
    const token = sign(secret, '7d'), key = `refreshToken:${id}:${jwt.decode(token).jti}`;
    keys.push(key, helper.refreshRetryKey(token));
    await redis.set(key, 'session', { EX: 60 });
    return token;
  };
  const track = token => { const key = `refreshToken:${id}:${jwt.decode(token).jti}`; keys.push(key); return key; };
  try {
    await t.test('missing, malformed, forged and expired tokens return 401', async () => {
      for (const token of [undefined, 'invalid', sign('wrong'), sign(secret, -1)]) await assert.rejects(auth.getNewToken(token), e => e.status === 401);
    });
    await t.test('12 simultaneous requests receive one pair; revocation blocks retries', async () => {
      const token = await seed();
      const results = await Promise.all(Array.from({ length: 12 }, () => auth.getNewToken(token)));
      assert.ok(results.every(result => result.newRefreshToken === results[0].newRefreshToken));
      const key = track(results[0].newRefreshToken);
      assert.equal(await redis.exists(`refreshToken:${id}:${jwt.decode(token).jti}`), 0);
      await redis.del(key);
      await assert.rejects(auth.getNewToken(token), e => e.status === 401);
    });
    await t.test('blocked account cannot renew', async () => {
      const token = await seed(); active = false;
      await assert.rejects(auth.getNewToken(token), e => e.status === 401); active = true;
    });
    await t.test('consumed token rejected after retry window', async () => {
      const token = await seed(); track((await auth.getNewToken(token)).newRefreshToken);
      await redis.del(helper.refreshRetryKey(token));
      await assert.rejects(auth.getNewToken(token), e => e.status === 401);
    });
  } finally {
    if (keys.length) await redis.del(keys);
    await redis.quit();
  }
});

test('frontend retains transient sessions and restores expired profiles', async t => {
  function fixture(responses, initial = { refreshToken: 'valid', accessToken: 'expired' }) {
    const jar = new Map(Object.entries(initial));
    const actions = load('../frontend/src/actions/auth.action.ts', {
      '@/constants/ttl.constant': { TTL: { ACCESS_TOKEN: 3600, REFRESH_TOKEN: 604800 } },
      'next/headers': { cookies: async () => ({ get: key => jar.has(key) ? { value: jar.get(key) } : undefined, set: (key, value) => jar.set(key, value), delete: key => jar.delete(key) }) },
    }, { fetch: async () => {
      const next = responses.shift();
      assert.ok(next, 'unexpected fetch');
      if (next instanceof Error) throw next;
      return new Response(JSON.stringify(next.body), { status: next.status });
    } });
    return { jar, actions };
  }
  await t.test('500, invalid JSON payload and network error preserve cookies', async () => {
    for (const response of [{ status: 500, body: {} }, { status: 200, body: { success: true, data: {} } }, new Error('offline')]) {
      const { jar, actions } = fixture([response]);
      assert.equal(await actions.makeRefreshToken(), false);
      assert.equal(jar.get('refreshToken'), 'valid');
    }
  });
  await t.test('401 clears invalid session', async () => {
    const { jar, actions } = fixture([{ status: 401, body: {} }]);
    assert.equal(await actions.makeRefreshToken(), false);
    assert.equal(jar.size, 0);
  });
  await t.test('expired or absent access token refreshes and loads profile', async () => {
    for (const accessToken of ['expired', undefined]) {
      const responses = accessToken ? [{ status: 401, body: {} }] : [];
      responses.push({ status: 201, body: { success: true, data: { newAccessToken: 'new', newRefreshToken: 'rotated' } } }, { status: 200, body: { success: true, data: { role: 'candidate' } } });
      const { jar, actions } = fixture(responses, accessToken ? { accessToken, refreshToken: 'valid' } : { refreshToken: 'valid' });
      assert.equal((await actions.getProfileAction()).success, true);
      assert.equal(jar.get('accessToken'), 'new');
      assert.equal(jar.get('refreshToken'), 'rotated');
    }
  });
});
