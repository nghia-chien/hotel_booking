import { useState, useCallback } from 'react';
import { roomService } from './services';
import type { Room, RoomType, SearchParams, SearchResultItem } from './types';
import toast from 'react-hot-toast';

export const useRoomFeature = () => {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [roomTypes] = useState<RoomType[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await roomService.getRooms();
      setRooms(response.data ?? []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchRooms = useCallback(async (params: SearchParams | string) => {
    setLoading(true);
    try {
      let queryString: string;
      if (typeof params === 'string') {
        queryString = params;
      } else {
        queryString = new URLSearchParams({
          checkIn: params.checkIn instanceof Date ? params.checkIn.toISOString() : params.checkIn,
          checkOut: params.checkOut instanceof Date ? params.checkOut.toISOString() : params.checkOut,
          guests: String(params.guests ?? 1),
        }).toString();
      }

      const response = await roomService.searchRooms(queryString);
      if (response.success) {
        setSearchResults(response.data ?? []);
      } else {
        toast.error('Không tìm thấy phòng phù hợp');
      }
      setHasSearched(true);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tìm kiếm phòng');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoomDetail = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await roomService.getRoomDetail(id);
      setCurrentRoom(response.data);
      return response.data as Room;
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải chi tiết phòng');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAvailability = useCallback(async (params: SearchParams & { roomId?: string }) => {
    try {
      const response = await roomService.checkAvailability(params);
      return response.data as SearchResultItem[];
    } catch (err: any) {
      toast.error(err.message || 'Không thể kiểm tra phòng trống');
      return [];
    }
  }, []);

  const resetSearch = useCallback(() => {
    setSearchResults([]);
    setHasSearched(false);
  }, []);

  return {
    loading,
    rooms,
    searchResults,
    roomTypes,
    currentRoom,
    hasSearched,
    fetchRooms,
    searchRooms,
    fetchRoomDetail,
    checkAvailability,
    resetSearch,
  };
};
