// Hook fetch tất cả rooms để hiển thị trên HomePage
// KHÔNG dùng auth — chỉ gọi public endpoints

import { useState, useEffect } from 'react'
import { apiRequest } from '../api/client'
import { useData } from '../context/DataContext'
import type { Room } from '../types/room'

interface RoomType {
  _id: string
  name: string
  basePrice: number
}

interface UseAllRoomsReturn {
  rooms: Room[]
  roomTypes: RoomType[]
  loading: boolean
  error: string | null
}

export default function useAllRooms(): UseAllRoomsReturn {
  const { rooms, roomTypes, cacheRooms, isDataCached } = useData()
  const [loading, setLoading] = useState(!isDataCached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isDataCached) {
      void fetchData()
    } else {
      setLoading(false)
    }
  }, [isDataCached])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [roomsRes, typesRes] = await Promise.all([
        apiRequest<{ success: boolean; data: Room[] }>(
          '/api/public/rooms',
          'GET'
        ),
        apiRequest<{ success: boolean; data: RoomType[] }>(
          '/api/room-types',
          'GET'
        ),
      ])

      cacheRooms(roomsRes.data ?? [], typesRes.data ?? [])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return { rooms, roomTypes, loading, error }
}
