interface RoomCardProps {
  image: string;
  roomType: string;
  totalPrice: number;
  capacity: number;
  onViewDetails: () => void;
  onBook: () => void;
}

export function RoomCard({
  image,
  roomType,
  totalPrice,
  capacity,
  onViewDetails,
  onBook
}: RoomCardProps) {
  return (
    <div className="bg-white rounded-2xl border p-4 flex flex-col">
      <img src={image} className="rounded-xl mb-4" />

      <h3>{roomType}</h3>
      <p> {capacity} People</p>

      <div className="mt-auto">
        <div className="text-2xl font-semibold">
          ${totalPrice.toFixed(0)}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={onViewDetails}
            className="flex-1 border rounded-lg p-2"
          >
            View
          </button>
          <button
            onClick={onBook}
            className="flex-1 bg-black text-white rounded-lg p-2"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}