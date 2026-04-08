import Room from "../models/Room.js";

export const findRoomById = async (id) => {
  return await Room.findById(id).populate("roomType");
};

export const findRoomsByFilter = async (filter) => {
  return await Room.find(filter).populate("roomType");
};

export const countRooms = async (filter) => {
  return await Room.countDocuments(filter);
};

export default {
  findRoomById,
  findRoomsByFilter,
  countRooms
};
