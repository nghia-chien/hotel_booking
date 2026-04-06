import dotenv from "dotenv";
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
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import { startBookingCron } from "./cron/bookingCron.js";

dotenv.config();

const app = express();

const isDev = process.env.NODE_ENV !== "production";

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
      callback(new Error(`CORS blocked: ${origin}`));
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

app.use("/api/auth", authRoutes);
app.use("/api/room-types", roomTypeRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/pricing-rules", pricingRuleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/public/rooms", publicRoomRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // Khởi động job dọn dẹp các booking pending quá 15 phút
  startBookingCron();
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;