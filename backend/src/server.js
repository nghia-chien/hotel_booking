import dotenv from "dotenv";
dotenv.config();

import * as Sentry from "@sentry/node";

// Initialize Sentry ideally before everything else
Sentry.init({
  dsn: process.env.SENTRY_DSN || "", // Configure this in .env
  integrations: [
    // nodeProfilingIntegration is disabled for now due to Node 24 compatibility
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, 
  beforeSend(event) {
    if (event.exception?.values?.[0]?.type === "ValidationError") {
      return null; // filter noise
    }
    return event;
  }
});

import express from "express";
import morgan from "morgan";
import path from "node:path";
import cors from "cors";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import roomTypeRoutes from "./routes/roomTypeRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import pricingRuleRoutes from "./routes/pricingRuleRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import publicRoomRoutes from "./routes/publicRoomRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import logger from "./utils/logger.js";
import crypto from "node:crypto";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import { initBookingExpiryCron } from "./cron/bookingExpiryCron.js";
import "./utils/queue.js"; // Initialize BullMQ workers

dotenv.config();

const app = express();

const isDev = process.env.NODE_ENV !== "production";

// Security: Secure HTTP headers
app.use(helmet());

// Security: General Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 100, // Developer max vs Prod max
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." }
});

// Security: Strict Auth Rate Limiting (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: isDev ? 1000 : 10, // Max 10 attempts / 15 min
  message: { success: false, message: "Too many login attempts, please wait 15 minutes." }
});

// Request Tracing & Structured Logging Middleware
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  
  if (req.user) {
    Sentry.setUser({ id: req.user._id, email: req.user.email });
  }
  Sentry.setTag("endpoint", req.path);

  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      requestId: req.requestId,
      userId: req.user?._id, // If authenticated later in chain
      ip: req.ip
    });
  });
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-origin requests (curl, mobile, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://nghia-chien.github.io" // Link Frontend Github Pages của bạn
      ];

      // Đọc URL từ biến môi trường (khuyên dùng khi deploy Backend)
      if (process.env.FRONTEND_URL) {
        allowedOrigins.push(...process.env.FRONTEND_URL.split(','));
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow tunnel domains in dev
      if (isDev && (
        origin.endsWith(".ngrok-free.app") ||
        origin.endsWith(".ngrok.io") ||
        origin.endsWith(".loca.lt")
      )) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);
    },
    credentials: false,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.send("Hotel Booking API is running...");
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/room-types", generalLimiter, roomTypeRoutes);
app.use("/api/rooms", generalLimiter, roomRoutes);
app.use("/api/pricing-rules", generalLimiter, pricingRuleRoutes);
app.use("/api/bookings", generalLimiter, bookingRoutes);
app.use("/api/payments", generalLimiter, paymentRoutes);
app.use("/api/public/rooms", generalLimiter, publicRoomRoutes);
app.use("/api/admin", generalLimiter, adminRoutes);
app.use("/api/reviews", generalLimiter, reviewRoutes);
app.use("/api/notifications", generalLimiter, notificationRoutes);

// New Sentry v8 error handler
Sentry.setupExpressErrorHandler(app);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
  
  // Khởi động job dọn dẹp các booking pending quá 10 phút
  initBookingExpiryCron();
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;