import mongoose from "mongoose";
import User from "../src/models/User.js";
import { api } from "./setup.js";

describe("Auth API", () => {
  const testEmail = "testuser@example.com";

  beforeAll(async () => {
    await User.deleteMany({ email: testEmail });
  });

  it("should register a new user", async () => {
    const res = await api.post("/api/auth/register").send({
      name: "Test User",
      email: testEmail,
      password: "password123"
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("should not allow duplicate registration", async () => {
    const res = await api.post("/api/auth/register").send({
      name: "Test User",
      email: testEmail,
      password: "password123"
    });

    expect(res.status).toBe(409);
  });

  it("should login with correct credentials", async () => {
    const res = await api.post("/api/auth/login").send({
      email: testEmail,
      password: "password123"
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("should reject wrong password", async () => {
    const res = await api.post("/api/auth/login").send({
      email: testEmail,
      password: "wrongpass"
    });

    expect(res.status).toBe(401);
  });
});

