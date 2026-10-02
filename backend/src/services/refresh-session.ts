import { createHash } from "node:crypto";

// Concurrent requests using the same token receive the same rotated pair.
// The short retry window only works while the successor session is still active.
export const ROTATE_SESSION = `
local cached = redis.call('GET', KEYS[3])
if cached then
  local retry = cjson.decode(cached)
  if redis.call('EXISTS', retry.key) == 1 then return retry.tokens end
  return false
end
if redis.call('EXISTS', KEYS[1]) == 0 then return false end
redis.call('SET', KEYS[2], ARGV[1], 'EX', ARGV[2])
redis.call('DEL', KEYS[1])
redis.call('SET', KEYS[3], cjson.encode({key=KEYS[2], tokens=ARGV[3]}), 'EX', 10)
return ARGV[3]
`;

export function refreshRetryKey(token: string) {
  return `refreshRetry:${createHash("sha256").update(token).digest("hex")}`;
}
