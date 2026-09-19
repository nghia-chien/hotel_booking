import { redisClient } from "../config/redis.js";
import logger from "./logger.js";
import crypto from "node:crypto";

/**
 * Acquire a distributed lock for a given resource key.
 * Uses Redis `SET key value EX ttl NX`.
 * 
 * @param {string} key - Lock resource key (e.g. `booking:room123:2026-09-20`)
 * @param {number} ttl - Time-to-live in seconds (default 15s)
 * @param {number} retries - Number of retry attempts (default 3)
 * @param {number} delayMs - Delay between retries in milliseconds (default 200ms)
 * @returns {Promise<{ key: string, val: string } | null>} Lock object if acquired, or null if lock failed / Redis unavailable
 */
export const acquireLock = async (key, ttl = 15, retries = 3, delayMs = 200) => {
  if (redisClient.status !== "ready" && redisClient.status !== "connecting") {
    // If Redis is offline, return null so caller can proceed with DB transaction checks
    return null;
  }

  const lockKey = `lock:${key}`;
  const lockVal = crypto.randomUUID();

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await redisClient.set(lockKey, lockVal, "EX", ttl, "NX");
      if (result === "OK") {
        return { key: lockKey, val: lockVal };
      }
    } catch (err) {
      logger.warn("Distributed lock acquisition failed on Redis", { key, attempt, error: err.message });
      return null;
    }

    if (attempt < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return null;
};

/**
 * Release a distributed lock using an atomic Lua script.
 * Only deletes the lock key if the stored value matches lock.val.
 * 
 * @param {{ key: string, val: string } | null} lock - Lock object returned by acquireLock
 */
export const releaseLock = async (lock) => {
  if (!lock || !lock.key || !lock.val) return;

  const luaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  try {
    if (redisClient.status === "ready") {
      await redisClient.eval(luaScript, 1, lock.key, lock.val);
    }
  } catch (err) {
    logger.warn("Distributed lock release warning", { key: lock.key, error: err.message });
  }
};

export default { acquireLock, releaseLock };
