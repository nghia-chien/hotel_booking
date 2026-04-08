import { create } from "zustand";
import type { Room } from "../types/room";
import { type View } from "react-big-calendar";

export interface RoomType {
  _id: string;
  name: string;
  basePrice: number;
}

export interface CalendarState {
  currentDate: Date;
  view: View;
}

export interface DataStoreValue {
  rooms: Room[];
  roomTypes: RoomType[];
  isDataCached: boolean;
  cacheRooms: (rooms: Room[], types: RoomType[]) => void;

  calendarState: CalendarState;
  setCalendarState: (state: CalendarState) => void;
}

export const useDataStore = create<DataStoreValue>()((set) => ({
  rooms: [],
  roomTypes: [],
  isDataCached: false,

  cacheRooms: (rooms, types) => {
    set({ rooms, roomTypes: types, isDataCached: true });
  },

  calendarState: {
    currentDate: new Date(),
    view: "month",
  },
  
  setCalendarState: (state) => {
    set({ calendarState: state });
  }
}));
