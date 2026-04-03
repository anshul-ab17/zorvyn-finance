import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

redis.on("error", (err) => console.error("Redis Client Error", err));

export const connectRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }
};

export const cacheSet = async (key: string, value: any, expiryInSeconds: number = 3600) => {
  await connectRedis();
  await redis.setEx(key, expiryInSeconds, JSON.stringify(value));
};

export const cacheGet = async (key: string) => {
  await connectRedis();
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};
