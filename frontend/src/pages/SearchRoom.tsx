import { useMemo, useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from 'react-i18next';
import BookingSearchForm from "../components/search/BookingSearchForm"
import { FilterSidebar } from "../components/FilterSideBar"
import { PropertyGrid } from "../components/property"

import { useRoomFeature } from "../features/room/hooks"
import { useBookingFeature } from "../features/booking/hooks"
import { usePaymentFeature } from "../features/payment/hooks"
import { useAuthFeature } from "../features/auth/hooks"
import { useCart } from "../context/CartContext"

import { estimateRating } from "../utils/roomUtils"
import type { AmenityKey } from "../constants/amenities"
import type { PropertyCardProps } from "../types/property"
import type { Room } from "../features/room/types"

const RoomsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthFeature()
  const { addToCart } = useCart()

  const {
    searchResults,
    loading,
    searchRooms,
    hasSearched,
    rooms: allRooms,
    fetchRooms,
  } = useRoomFeature()

  const { createNewBooking } = useBookingFeature()
  const { createVNPayOrder } = usePaymentFeature()

  const [searchParams, setSearchParams] = useState<{
    checkIn: Date
    checkOut: Date
    guests: number
  } | null>(null)

  const initialSearchDone = useRef(false)

  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(1500)
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityKey[]>([])
  const [minRating, setMinRating] = useState<number>(0)

  useEffect(() => {
    if (!hasSearched && !initialSearchDone.current) void fetchRooms()
  }, [hasSearched, fetchRooms])

  // Handle URL search params
  useEffect(() => {
    if (initialSearchDone.current) return;

    const queryParams = new URLSearchParams(location.search)
    const checkInStr = queryParams.get('checkIn')
    const checkOutStr = queryParams.get('checkOut')
    const guestsStr = queryParams.get('guests')

    if (checkInStr && checkOutStr && guestsStr) {
      const ci = new Date(checkInStr)
      const co = new Date(checkOutStr)
      const g = parseInt(guestsStr)

      if (!isNaN(ci.getTime()) && !isNaN(co.getTime()) && !isNaN(g)) {
        initialSearchDone.current = true
        const params = { checkIn: ci, checkOut: co, guests: g }
        setSearchParams(params)
        handleSearch(params)
      }
    }
  }, [location.search])

  const nights = useMemo(() => {
    if (!searchParams) return 1
    return Math.max(
      1,
      Math.round(
        (searchParams.checkOut.getTime() - searchParams.checkIn.getTime()) /
        (24 * 60 * 60 * 1000)
      )
    )
  }, [searchParams])

  const handleSearch = async ({
    checkIn,
    checkOut,
    guests,
  }: {
    checkIn?: Date
    checkOut?: Date
    guests: number
  }) => {
    if (!checkIn || !checkOut) return
    setSearchParams({ checkIn, checkOut, guests })
    await searchRooms({ checkIn, checkOut, guests })
  }

  const getRoomId = (room: Room) => room._id ?? room.id ?? ''

  const handleBooking = async (room: Room) => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: window.location.pathname } } })
      return
    }
    if (!searchParams) {
      navigate(`/roomdetail/${getRoomId(room)}`)
      return
    }

    try {
      const booking = await createNewBooking({
        roomId: getRoomId(room),
        checkIn: searchParams.checkIn.toISOString(),
        checkOut: searchParams.checkOut.toISOString(),
        guests: searchParams.guests,
      })
      if (booking) {
        const bookingId = booking._id ?? booking.id
        const paymentUrl = await createVNPayOrder([bookingId])
        window.location.assign(paymentUrl)
      }
    } catch (err) {
      navigate("/my-bookings")
    }
  }

  const handleAddToCart = (room: Room) => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: window.location.pathname } } })
      return
    }
    if (!searchParams) {
      return
    }
    const pricePerNight = room.roomType?.basePrice ?? 0
    const totalPrice = pricePerNight * nights

    addToCart({
      roomId: getRoomId(room),
      roomTypeName: room.roomType?.name || "Phòng",
      roomNumber: room.roomNumber,
      image: room.images?.[0],
      checkIn: searchParams.checkIn.toISOString(),
      checkOut: searchParams.checkOut.toISOString(),
      guests: searchParams.guests,
      totalPrice,
      capacity: room.capacity,
      amenities: room.amenities,
    })
  }

  const displayResults = useMemo(() => {
    if (hasSearched) return searchResults
    return allRooms.map((r) => ({
      room: r,
      totalPrice: r.roomType?.basePrice ?? 0,
    }))
  }, [hasSearched, searchResults, allRooms])

  const filteredResults = useMemo(() => {
    return displayResults.filter(({ room, totalPrice }) => {
      if (totalPrice < minPrice || totalPrice > maxPrice) return false

      if (selectedAmenities.length > 0) {
        const roomAms = (room.amenities ?? []).map((a) => a.toLowerCase())
        if (!selectedAmenities.every((a) => roomAms.some((ra) => ra.includes(a))))
          return false
      }

      if (minRating > 0) {
        const rating = room.avgRating ?? estimateRating(getRoomId(room))
        if (rating < minRating) return false
      }

      return true
    })
  }, [displayResults, minPrice, maxPrice, selectedAmenities, minRating])

  const mappedItems: PropertyCardProps[] = filteredResults.map(({ room, totalPrice }) => ({
    id: getRoomId(room),
    image: room.images?.[0] ?? '',
    roomNumber: room.roomNumber ?? 'Phòng',
    roomType: room.roomType?.name ?? 'Khách sạn',
    // location: room.roomType?.name ?? 'Khách sạn',
    pricePerNight: hasSearched ? totalPrice / nights : totalPrice,
    totalPrice: hasSearched ? totalPrice : undefined,
    priceLabel: hasSearched ? undefined : '/đêm',
    capacity: room.capacity,
    rating: room.avgRating ?? estimateRating(getRoomId(room)),
    amenities: room.amenities,
    onBook: () => handleBooking(room),
    onAddToCart: () => handleAddToCart(room),
    onViewDetails: () => navigate(`/roomdetail/${getRoomId(room)}`),
  }))

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

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
        <aside className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar rounded-3xl">
          <FilterSidebar
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => {
              setMinPrice(min)
              setMaxPrice(max)
            }}
            selectedAmenities={selectedAmenities}
            onAmenitiesChange={(values) => setSelectedAmenities(values as AmenityKey[])}
            minRating={minRating}
            onMinRatingChange={setMinRating}
          />
        </aside>

        <section>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              {loading
                ? t('search.searching')
                : t('search.available', { count: filteredResults.length })}
            </p>
          </div>

          <PropertyGrid
            items={mappedItems}
            loading={loading}
            columns={3}
            emptyMessage={t('search.noResult')}
          />
        </section>
      </div>
    </div>
  )
}

export default RoomsPage