import Redis from "ioredis";
import logger from "../utils/logger.js";

const redisUrl = (process.env.REDIS_URL || "redis://127.0.0.1:6379").trim();

export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  // If using rediss://, ioredis handles TLS. Otherwise, no TLS.
  tls: redisUrl.startsWith("rediss://") ? {} : undefined,
  retryStrategy(times) {
    // Retry every 10 seconds to reduce CPU usage and log spam
    return 1000000;
  },
  reconnectOnError: (err) => {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

redisClient.on("connect", () => {
  logger.info("Connected to Redis successfully");
});

let lastLogTime = 0;
redisClient.on("error", (err) => {
  const now = Date.now();
  // Only log error once every 30 seconds to keep terminal clean
  if (now - lastLogTime > 30000) {
    logger.error("Redis Offline - Architectural features (Cache/Queue) are disabled", { message: err.message });
    lastLogTime = now;
  }
});
