// Fix DNS SRV issue (phải đặt trước khi dùng mongoose)
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;