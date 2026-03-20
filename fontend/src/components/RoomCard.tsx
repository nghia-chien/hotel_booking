import { Button } from "./ui/button";

interface RoomCardProps {
  image: string;
  roomType: string;
  capacity: number;
  pricePerNight?: number;
  totalPrice?: number;
  onBook?: () => void;
  onViewDetails?: () => void;
}

export function RoomCard({
  image,
  roomType,
  capacity,
  pricePerNight,
  totalPrice,
  onBook,
  onViewDetails
}: RoomCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E8DFD8] transition-all hover:shadow-md flex flex-col">
      <div className="aspect-[4/3] overflow-hidden bg-[#F5F1ED]">
        <img
          src={image}
          alt={roomType}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="mb-2 text-[#2C2C2C]">{roomType}</h3>
        <p className="mb-4 text-sm text-[#666666]">Tối đa {capacity} khách</p>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            {pricePerNight != null ? (
              <>
                <div className="text-2xl text-[#2C2C2C]">
                  ${pricePerNight.toFixed(0)}
                </div>
                <div className="text-sm text-[#666666]">/ đêm</div>
              </>
            ) : (
              <>
                <div className="text-2xl text-[#2C2C2C]">
                  ${Number(totalPrice ?? 0).toFixed(0)}
                </div>
                <div className="text-sm text-[#666666]">tổng tiền</div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {onViewDetails && (
              <Button
                variant="outline"
                className="border-[#E8DFD8] bg-white hover:bg-[#F5F1ED]"
                onClick={onViewDetails}
              >
                Xem chi tiết
              </Button>
            )}
            {onBook && (
              <Button
                className="bg-[#2C2C2C] hover:bg-[#3A3A3A] text-white"
                onClick={onBook}
              >
                Đặt phòng
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
