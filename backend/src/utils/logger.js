import winston from "winston";
import path from "node:path";

const { combine, timestamp, printf, colorize, json } = winston.format;

// Standard log format for Console (readable)
const consoleFormat = printf(({ level, message, timestamp, requestId, userId, errorCode }) => {
  const reqId = requestId ? ` [Req:${requestId}]` : "";
  const uId = userId ? ` [User:${userId}]` : "";
  const errCode = errorCode ? ` [Error:${errorCode}]` : "";
  return `${timestamp} ${level}:${reqId}${uId}${errCode} ${message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }), // Capture stack trace
    json() // Log as JSON for production files
  ),
  transports: [
    // 1. Log errors to error.log
    new winston.transports.File({ 
      filename: path.join(process.cwd(), "logs", "error.log"), 
      level: "error" 
    }),
    // 2. Log everything (INFO and above) to combined.log
    new winston.transports.File({ 
      filename: path.join(process.cwd(), "logs", "combined.log") 
    }),
  ],
});

// If not in production, log to console with colors
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "HH:mm:ss" }),
        consoleFormat
      ),
    })
  );
}

export default logger;
