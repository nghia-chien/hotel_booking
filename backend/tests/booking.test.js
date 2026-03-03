import mongoose from "mongoose";
import User from "../src/models/User.js";
import RoomType from "../src/models/RoomType.js";
import Room from "../src/models/Room.js";
import Booking from "../src/models/Booking.js";
import { api } from "./setup.js";

describe("Booking API - double booking protection", () => {
  let userToken;
  let roomId;
  let roomTypeId;

  beforeAll(async () => {
    await Booking.deleteMany({});
    await Room.deleteMany({});
    await RoomType.deleteMany({});
    await User.deleteMany({ email: "bookingtest@example.com" });

    const userRes = await api.post("/api/auth/register").send({
      name: "Booking Tester",
      email: "bookingtest@example.com",
      password: "password123"
    });
    userToken = userRes.body.data.accessToken;

    const rt = await RoomType.create({
      name: "Test Type",
      basePrice: 100,
      defaultCapacity: 2
    });
    roomTypeId = rt._id;

    const room = await Room.create({
      roomNumber: "T-101",
      roomType: roomTypeId,
      capacity: 2,
      amenities: [],
      policies: "",
      images: [],
      isActive: true
    });
    roomId = room._id;
  });

  it("should create first booking", async () => {
    const checkIn = new Date();
    const checkOut = new Date(checkIn.getTime() + 3 * 24 * 60 * 60 * 1000);

    const res = await api
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        roomId: roomId.toString(),
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests: 2
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should block overlapping booking on same room", async () => {
    const checkIn = new Date();
    const checkOut = new Date(checkIn.getTime() + 2 * 24 * 60 * 60 * 1000);

    const res = await api
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        roomId: roomId.toString(),
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests: 2
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already booked/i);
  });
});

