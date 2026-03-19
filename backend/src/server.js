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
import publicRoomRoutes from "./routes/publicRoomRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./middlewares/auth.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174"
    ],
    credentials: false
  })
);
app.use(express.json());
app.use(logger);
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Health check
app.get("/", (req, res) => {
  res.send("Hotel Booking API is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/room-types", roomTypeRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/pricing-rules", pricingRuleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/public/rooms", publicRoomRoutes);
app.use("/api/payments", paymentRoutes);

// 404 & error handler
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
