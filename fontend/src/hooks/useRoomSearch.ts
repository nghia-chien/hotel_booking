import { useState } from "react"
import { searchRooms } from "../api/booking.api"
import type { SearchResultItem } from "../types/room"

export const useRoomSearch = () => {
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (params: string) => {
    try {
      setLoading(true)
      const res = await searchRooms(params)
      setResults(res.data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return { results, loading, error, search }
}