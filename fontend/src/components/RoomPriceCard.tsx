import { formatUSD } from "../utils/format"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import type { Room } from "../types/room"

export default function RoomPriceCard({ room }: { room: Room }) {
  const navigate = useNavigate()

  return (
    <aside className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm h-fit space-y-4">
      <h3 className="text-lg font-semibold">Thông tin giá</h3>

      <p className="text-sm text-black/60">
        Giá cơ bản (theo loại phòng):
      </p>

      <p className="text-2xl font-semibold">
        {room.roomType?.basePrice != null
          ? formatUSD(room.roomType.basePrice)
          : "Liên hệ"}
      </p>

      <Button
        className="w-full mt-2 bg-[#2B2B2B] text-white rounded-xl"
        onClick={() => navigate("/rooms")}
      >
        Quay lại tìm phòng
      </Button>
    </aside>
  )
}