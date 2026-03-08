import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { getRoomDetail } from "../api/room.api"
import type { Room } from "../types/room"

import RoomGallery from "../components/RoomGallery"
import RoomPriceCard from "../components/RoomPriceCard"

import { Button } from "../components/ui/button"

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return

      try {
        setLoading(true)
        const res = await getRoomDetail(id)
        setRoom(res.data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    void fetchRoom()
  }, [id])

  if (loading) return <p>Đang tải thông tin phòng...</p>

  if (error || !room) {
    return <p>Không tìm thấy phòng</p>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
      <div className="space-y-6">

        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <RoomGallery
          images={room.images}
          roomNumber={room.roomNumber}
        />

      </div>

      <RoomPriceCard room={room} />
    </div>
  )
}

