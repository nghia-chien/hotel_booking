import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import BookingSearchForm from "../components/search/BookingSearchForm"
import { FilterSidebar } from "../components/FilterSideBar"
import { PropertyGrid } from "../components/property"

import usePropertySearch from "../hooks/usePropertySearch"
import { estimateRating } from "../utils/roomUtils"

import { createBooking } from "../api/booking.api"
import { useAuth } from "../context/AuthContext"
import { useData } from "../context/DataContext"

import type { Room, CreateBookingPayload } from "../types/room"
import type { AmenityKey } from "../constants/amenities"
import type { PropertyCardProps } from "../types/property"

const RoomsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { rooms: cachedRooms } = useData()
  const { results, loading, error, search, hasSearched } = usePropertySearch()

  const [searchParams, setSearchParams] = useState<{
    checkIn: Date
    checkOut: Date
    guests: number
  } | null>(null)

  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(1500)
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityKey[]>([])
  const [minRating, setMinRating] = useState<number>(0)
  
  const nights =
    searchParams != null
      ? Math.max(
          1,
          Math.round(
            (searchParams.checkOut.getTime() - searchParams.checkIn.getTime()) /
              (24 * 60 * 60 * 1000)
          )
        )
      : 1

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
    if (!user) {
      navigate("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
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

  const displayResults = useMemo(() => {
    if (hasSearched) return results
    if (loading) return []
    // Pre-load: show all rooms before user hits search
    return cachedRooms.map(r => ({
      room: r,
      totalPrice: r.roomType?.basePrice ?? 0
    }))
  }, [results, cachedRooms, loading, hasSearched])

  const filteredResults = useMemo(() => {
    return displayResults.filter(({ room, totalPrice }) => {
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
        const rating = (room as any).avgRating ?? estimateRating(room._id);
        if (rating < minRating) return false
      }

      return true
    })
  }, [displayResults, minPrice, maxPrice, selectedAmenities, minRating])

  const mappedItems: PropertyCardProps[] = filteredResults.map((item) => {
    const images = item.room.images ?? []
    
    return {
      id: item.room._id,
      image: images[0] ? images[0] : '',
      name: `${item.room.roomType?.name ?? 'Phòng'} · #${item.room.roomNumber}`,
      location: item.room.roomType?.name ?? '',
      pricePerNight: hasSearched ? item.totalPrice / nights : item.totalPrice,
      totalPrice: hasSearched ? item.totalPrice : undefined,
      priceLabel: hasSearched ? undefined : '/đêm',
      capacity: item.room.capacity,
      rating: (item.room as any).avgRating ?? estimateRating(item.room._id),
      amenities: item.room.amenities,
      onBook: () => handleBooking(item.room),
      onViewDetails: () => navigate(`/roomdetail/${item.room._id}`),
    }
  })

  return (
    <div
      className="min-h-[calc(100vh-140px)]"
      style={{ maxWidth: 1440, margin: "0 auto", padding: "0 1.5rem" }}
    >
      <BookingSearchForm 
        variant="page" 
        onSearch={handleSearch} 
        loading={loading}
        className="mb-8"
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
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
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              {loading
                ? "Đang tìm kiếm phòng phù hợp..."
                : `${filteredResults.length} phòng có sẵn cho kỳ nghỉ của bạn`}
            </p>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <PropertyGrid
            items={mappedItems}
            loading={loading}
            columns={3}
            emptyMessage="Không tìm thấy phòng phù hợp. Hãy thử thay đổi ngày hoặc bộ lọc."
          />
        </section>
      </div>
    </div>
  )
}

export default RoomsPage;