import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL!,
})
  .on("error", (err) => console.log("Redis Client Error", err));

redisClient.connect();