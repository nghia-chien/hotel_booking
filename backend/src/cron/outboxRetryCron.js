import cron from "node-cron";
import OutboxEmail from "../models/OutboxEmail.js";
import { sendDirectEmail } from "../utils/queue.js";
import logger from "../utils/logger.js";

/**
 * Cron job running every 5 minutes to retry sending pending emails from OutboxEmail table.
 */
export const initOutboxRetryCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();
      const pendingEmails = await OutboxEmail.find({
        status: "PENDING",
        retryCount: { $lt: 5 },
        $or: [{ nextRetryAt: null }, { nextRetryAt: { $lte: now } }]
      }).limit(20);

      if (!pendingEmails.length) return;

      logger.info(`[Outbox Cron] Processing ${pendingEmails.length} pending outbox emails...`);

      for (const email of pendingEmails) {
        try {
          await sendDirectEmail({
            to: email.to,
            subject: email.subject,
            html: email.html
          });

          email.status = "SENT";
          email.sentAt = new Date();
          email.error = undefined;
          await email.save();

          logger.info(`[Outbox Cron] Successfully sent pending email to ${email.to}`);
        } catch (err) {
          email.retryCount += 1;
          email.error = err.message;

          if (email.retryCount >= 5) {
            email.status = "FAILED";
            logger.error(`[Outbox Cron] Email permanently failed for ${email.to} after 5 attempts`, { error: err.message });
          } else {
            // Exponential backoff for next retry: 2, 4, 8, 16 minutes
            const backoffMinutes = Math.pow(2, email.retryCount);
            email.nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);
            logger.warn(`[Outbox Cron] Email retry ${email.retryCount} failed for ${email.to}, next retry at ${email.nextRetryAt.toISOString()}`);
          }

          await email.save();
        }
      }
    } catch (error) {
      logger.error("[Outbox Cron Error] Outbox Retry Task failed:", { error: error.message });
    }
  });

  logger.info("[Outbox Cron] Outbox Retry Task initialized (5 min interval)");
};

export default { initOutboxRetryCron };
