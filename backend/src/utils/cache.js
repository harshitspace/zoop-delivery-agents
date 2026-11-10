import redisClient from "../db/redis.js";

const TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS) || 60;

export const cacheGet = async (key) => {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error(`Cache GET failed for ${key}:`, err.message);
    return null;
  }
};

export const cacheSet = async (key, value) => {
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: TTL_SECONDS });
  } catch (err) {
    console.error(`Cache SET failed for ${key}:`, err.message);
  }
};

export const cacheDel = async (keys) => {
  try {
    const list = Array.isArray(keys) ? keys : [keys];
    if (list.length > 0) {
      await redisClient.del(list);
    }
  } catch (err) {
    console.error(`Cache DEL failed for ${keys}:`, err.message);
  }
};

export const getOrSetCache = async (key, fetchFn) => {
  const cached = await cacheGet(key);
  if (cached !== null) {
    return { data: cached, fromCache: true };
  }

  const data = await fetchFn();

  if (data !== null && data !== undefined) {
    await cacheSet(key, data);
  }

  return { data, fromCache: false };
};

