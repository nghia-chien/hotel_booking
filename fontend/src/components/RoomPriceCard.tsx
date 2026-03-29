import { useTranslation } from "react-i18next"
import { formatUSD } from "../utils/format"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import type { Room } from "../types/room"

export default function RoomPriceCard({ room }: { room: Room }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <aside className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm h-fit space-y-4">
      <h3 className="text-lg font-semibold">{t('roomPriceCard.title')}</h3>

      <p className="text-sm text-black/60">
        {t('roomPriceCard.basePriceLabel')}
      </p>

      <p className="text-2xl font-semibold">
        {room.roomType?.basePrice != null
          ? formatUSD(room.roomType.basePrice)
          : t('roomPriceCard.contact')}
      </p>

      <Button
        className="w-full mt-2 bg-[#2B2B2B] text-white rounded-xl"
        onClick={() => navigate("/rooms")}
      >
        {t('roomPriceCard.backToSearch')}
      </Button>
    </aside>
  )
}