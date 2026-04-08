import { Queue, Worker } from "bullmq";
import { redisClient } from "../config/redis.js";
import logger from "./logger.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const emailQueue = new Queue("email-queue", {
  connection: redisClient
});

// Create Worker
export const emailWorker = new Worker("email-queue", async (job) => {
  const { to, subject, html } = job.data;
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn("Email credentials not found, skipping email job", { jobId: job.id });
    return;
  }

  logger.info(`Processing email job for ${to}`, { jobId: job.id });
  
  await transporter.sendMail({
    from: `"HotelBooking" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
  
  logger.info(`Email sent to ${to}`, { jobId: job.id });
}, { 
  connection: redisClient,
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000
  }
});

// Graceful connection error handling for worker
emailWorker.on("error", (err) => {
  logger.error("BullMQ Worker Connection Error", { error: err.message });
});

emailWorker.on("completed", (job) => {
  logger.info(`Job completed: ${job.id}`);
});

emailWorker.on("failed", (job, err) => {
  logger.error(`Job failed: ${job?.id}`, { error: err.message });
});
