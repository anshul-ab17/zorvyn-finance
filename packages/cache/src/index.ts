import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;
let connected = false;

const getClient = async (): Promise<RedisClientType | null> => {
  if (!process.env.REDIS_URL) return null;
  if (connected && redisClient) return redisClient;

  try {
    redisClient = createClient({ url: process.env.REDIS_URL }) as RedisClientType;
    redisClient.on("error", (err) => {
      console.warn("[cache] Redis error:", err.message);
      connected = false;
    });
    await redisClient.connect();
    connected = true;
    return redisClient;
  } catch (err) {
    console.warn("[cache] Redis unavailable, falling back to no-cache mode");
    return null;
  }
};

export const cacheGet = async <T = unknown>(key: string): Promise<T | null> => {
  const client = await getClient();
  if (!client) return null;
  try {
    const data = await client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: unknown,
  expiryInSeconds = 3600
): Promise<void> => {
  const client = await getClient();
  if (!client) return;
  try {
    await client.setEx(key, expiryInSeconds, JSON.stringify(value));
  } catch {
    // silently fail
  }
};

export const cacheDelete = async (key: string): Promise<void> => {
  const client = await getClient();
  if (!client) return;
  try {
    await client.del(key);
  } catch {
    // silently fail
  }
};

export const invalidatePattern = async (pattern: string): Promise<void> => {
  const client = await getClient();
  if (!client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(keys);
  } catch {
    // silently fail
  }
};
