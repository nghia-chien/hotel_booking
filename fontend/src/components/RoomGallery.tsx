import { useState } from "react"
import { toImageUrl } from "../utils/format"

interface Props {
  images?: string[]
  roomNumber: string
}

export default function RoomGallery({ images = [], roomNumber }: Props) {
  const [activeImage, setActiveImage] = useState(images[0] || "")

  const hero = activeImage
    ? toImageUrl(activeImage)
    : images[0]
    ? toImageUrl(images[0])
    : ""

  return (
    <div className="bg-[#F7F2EA] rounded-2xl overflow-hidden border border-black/5">
      <div className="aspect-[4/3] bg-[#EFE8DE]">
        {hero ? (
          <img
            src={hero}
            alt={`Phòng ${roomNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-black/50">
            Chưa có ảnh phòng
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-white">
          {images.map((img) => (
            <img
              key={img}
              src={toImageUrl(img)}
              className={`w-16 h-16 rounded-xl object-cover cursor-pointer border`}
              onClick={() => setActiveImage(img)}
            />
          ))}
        </div>
      )}
    </div>
  )
}