import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "../src/server.js";
import request from "supertest";

dotenv.config();

beforeAll(async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be set for tests");
  }
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

export const api = request(app);

