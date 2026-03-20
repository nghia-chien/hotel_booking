import mongoose from "mongoose";
import User from "../src/models/User.js";
import RoomType from "../src/models/RoomType.js";
import Room from "../src/models/Room.js";
import Booking from "../src/models/Booking.js";
import { api } from "./setup.js";

describe("Booking API - double booking protection", () => {
  let userToken;
  let roomId;
  let room2Id;
  let roomTypeId;
  let adminToken;

  beforeAll(async () => {
    await Booking.deleteMany({});
    await Room.deleteMany({});
    await RoomType.deleteMany({});
    await User.deleteMany({ email: "bookingtest@example.com" });
    await User.deleteMany({ email: "admintest@example.com" });

    const userRes = await api.post("/api/auth/register").send({
      name: "Booking Tester",
      email: "bookingtest@example.com",
      password: "password123"
    });
    userToken = userRes.body.data.accessToken;

    const adminRes = await api.post("/api/auth/register").send({
      name: "Admin Tester",
      email: "admintest@example.com",
      password: "password123"
    });
    await User.findOneAndUpdate(
      { email: "admintest@example.com" },
      { role: "admin" }
    );
    // login again to get token with updated role
    const adminLogin = await api.post("/api/auth/login").send({
      email: "admintest@example.com",
      password: "password123"
    });
    adminToken = adminLogin.body.data.accessToken;

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

    const room2 = await Room.create({
      roomNumber: "T-102",
      roomType: roomTypeId,
      capacity: 1,
      amenities: [],
      policies: "",
      images: [],
      isActive: true
    });
    room2Id = room2._id;
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

  it("should filter search results by guests capacity", async () => {
    const checkIn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const checkOut = new Date(checkIn.getTime() + 2 * 24 * 60 * 60 * 1000);

    const res = await api.get(
      `/api/bookings/search?checkIn=${encodeURIComponent(
        checkIn.toISOString()
      )}&checkOut=${encodeURIComponent(checkOut.toISOString())}&guests=2`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const items = res.body.data;
    expect(Array.isArray(items)).toBe(true);
    // room2 capacity=1 should not appear
    const ids = items.map((x) => x.room?._id || x.room?.toString?.());
    expect(ids).toContain(roomId.toString());
    expect(ids).not.toContain(room2Id.toString());
  });

  it("should allow cancel before cancellation deadline", async () => {
    const checkIn = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const checkOut = new Date(checkIn.getTime() + 24 * 60 * 60 * 1000);

    const createRes = await api
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        roomId: room2Id.toString(),
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests: 1
      });
    expect(createRes.status).toBe(201);

    const cancelRes = await api
      .post(`/api/bookings/${createRes.body.data._id}/cancel`)
      .set("Authorization", `Bearer ${userToken}`)
      .send();

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe("Cancelled");
  });

  it("should block cancel after cancellation deadline", async () => {
    const checkIn = new Date(Date.now() + 60 * 60 * 1000);
    const checkOut = new Date(checkIn.getTime() + 24 * 60 * 60 * 1000);

    const createRes = await api
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        roomId: room2Id.toString(),
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests: 1
      });
    expect(createRes.status).toBe(201);

    const cancelRes = await api
      .post(`/api/bookings/${createRes.body.data._id}/cancel`)
      .set("Authorization", `Bearer ${userToken}`)
      .send();

    expect(cancelRes.status).toBe(400);
    expect(cancelRes.body.message).toMatch(/deadline/i);
  });

  it("should pay booking and allow check-in/check-out", async () => {
    const checkIn = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const checkOut = new Date(checkIn.getTime() + 24 * 60 * 60 * 1000);

    const createRes = await api
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        roomId: room2Id.toString(),
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests: 1
      });
    expect(createRes.status).toBe(201);

    const payRes = await api
      .post(`/api/bookings/${createRes.body.data._id}/pay`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ method: "mock", cardLast4: "4242" });
    expect(payRes.status).toBe(200);
    expect(payRes.body.data.booking.status).toBe("Confirmed");
    expect(payRes.body.data.booking.paymentStatus).toBe("Paid");

    const checkInRes = await api
      .post(`/api/bookings/${createRes.body.data._id}/check-in`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send();
    expect(checkInRes.status).toBe(200);
    expect(checkInRes.body.data.status).toBe("CheckedIn");

    const checkOutRes = await api
      .post(`/api/bookings/${createRes.body.data._id}/check-out`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send();
    expect(checkOutRes.status).toBe(200);
    expect(checkOutRes.body.data.status).toBe("CheckedOut");
  });
});

