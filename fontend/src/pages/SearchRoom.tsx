import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { SearchBar } from "../components/SearchBar"
import { FilterSidebar } from "../components/FilterSideBar"
import { RoomCard } from "../components/RoomCard"

import { calculatePrice } from "../utils/calculatePrice"
import { estimateRating, toImageUrl } from "../utils/roomUtils"

import { useRoomSearch } from "../hooks/useRoomSearch"

import { createBooking } from "../api/booking.api"

import type { Room, CreateBookingPayload } from "../types/room"
import type { AmenityKey } from "../constants/amenities"

const RoomsPage = () => {
  const navigate = useNavigate()

  const { results, loading, error, search } = useRoomSearch()

  const [searchParams, setSearchParams] = useState<{
    checkIn: Date
    checkOut: Date
    guests: number
  } | null>(null)

  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(1500)
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityKey[]>([])
  const [minRating, setMinRating] = useState<number>(0)

  const handleSearch = async ({
    checkIn,
    checkOut,
    guests
  }: {
    checkIn?: Date
    checkOut?: Date
    guests: number
  }) => {
    if (!checkIn || !checkOut) return

    setSearchParams({ checkIn, checkOut, guests })

    const params = new URLSearchParams({
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      guests: String(guests),
      minPrice: String(minPrice),
      maxPrice: String(maxPrice)
    }).toString()

    await search(params)
  }

  const handleBooking = async (room: Room) => {
    if (!searchParams) return

    const payload: CreateBookingPayload = {
      roomId: room._id,
      checkIn: searchParams.checkIn.toISOString(),
      checkOut: searchParams.checkOut.toISOString(),
      guests: searchParams.guests
    }

    const res = await createBooking(payload) as { data: any }

    navigate("/my-bookings", {
      state: {
        booking: res.data
      }
    })
  }

  const filteredResults = useMemo(() => {
    return results.filter(({ room, totalPrice }) => {
      if (totalPrice < minPrice || totalPrice > maxPrice) return false

      if (selectedAmenities.length > 0) {
        const roomAmenities = (room.amenities || []).map((a) =>
          a.toLowerCase()
        )

        const ok = selectedAmenities.every((a) =>
          roomAmenities.some((ra) => ra.includes(a))
        )

        if (!ok) return false
      }

      if (minRating > 0) {
        const rating = estimateRating(room._id)
        if (rating < minRating) return false
      }

      return true
    })
  }, [results, minPrice, maxPrice, selectedAmenities, minRating])

  return (
    <div
      className="min-h-[calc(100vh-140px)]"
      style={{ maxWidth: 1440, margin: "0 auto" }}
    >
      <SearchBar onSearch={handleSearch} loading={loading} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <aside>
          <FilterSidebar
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => {
              setMinPrice(min)
              setMaxPrice(max)
            }}
            selectedAmenities={selectedAmenities}
            onAmenitiesChange={(values) =>
              setSelectedAmenities(values as AmenityKey[])
            }
            minRating={minRating}
            onMinRatingChange={setMinRating}
          />
        </aside>

        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-black/60">
              {loading
                ? "Đang tải kết quả..."
                : `${filteredResults.length} phòng phù hợp`}
            </p>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredResults.map((item) => {
              const images = item.room.images || []
              const hero = images[0] ? toImageUrl(images[0]) : ""

              const total =
                searchParams != null
                  ? calculatePrice(
                      searchParams.checkIn,
                      searchParams.checkOut,
                      item.totalPrice
                    )
                  : item.totalPrice

              return (
                <RoomCard
                  key={item.room._id}
                  image={hero}
                  roomType={`${item.room.roomType?.name} · #${item.room.roomNumber}`}
                  totalPrice={total}
                  capacity={item.room.capacity}
                  onBook={() => handleBooking(item.room)}
                  onViewDetails={() =>
                    navigate(`/roomdetail/${item.room._id}`)
                  }
                />
              )
            })}
          </div>

          {!loading && filteredResults.length === 0 && !error && (
            <div className="mt-6 bg-[#F7F2EA] border border-black/5 rounded-2xl p-6 text-sm text-black/60">
              Không tìm thấy phòng phù hợp. Hãy thử thay đổi ngày, số khách
              hoặc bộ lọc.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default RoomsPage;