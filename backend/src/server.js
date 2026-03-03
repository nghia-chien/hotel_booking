import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/database.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 3300;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();