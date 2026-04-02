import { createContext, useContext, useState, type ReactNode, useCallback } from "react";
import type { Room } from "../types/room";
import { type View } from "react-big-calendar";

interface RoomType {
  _id: string;
  name: string;
  basePrice: number;
}

interface CalendarState {
  currentDate: Date;
  view: View;
}

interface DataContextValue {
  // Room data cache
  rooms: Room[];
  roomTypes: RoomType[];
  cacheRooms: (rooms: Room[], types: RoomType[]) => void;
  isDataCached: boolean;

  // Calendar State
  calendarState: CalendarState;
  setCalendarState: (state: CalendarState) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isDataCached, setIsDataCached] = useState(false);

  const [calendarState, setCalendarState] = useState<CalendarState>({
    currentDate: new Date(),
    view: "month",
  });

  const cacheRooms = useCallback((newRooms: Room[], newTypes: RoomType[]) => {
    setRooms(newRooms);
    setRoomTypes(newTypes);
    setIsDataCached(true);
  }, []);

  const value: DataContextValue = {
    rooms,
    roomTypes,
    cacheRooms,
    isDataCached,
    calendarState,
    setCalendarState,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within DataProvider");
  }
  return ctx;
};
