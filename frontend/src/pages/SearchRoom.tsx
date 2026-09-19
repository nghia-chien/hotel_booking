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
import { Sparkles, ArrowUpDown, X, LayoutGrid, Grid3X3, SlidersHorizontal } from "lucide-react";

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'rating_desc' | 'capacity_desc';

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
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [columns, setColumns] = useState<3 | 2>(3)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

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
    let result = displayResults.filter(({ room, totalPrice }) => {
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

    // Apply Sorting
    if (sortBy === 'price_asc') {
      result = [...result].sort((a, b) => a.totalPrice - b.totalPrice)
    } else if (sortBy === 'price_desc') {
      result = [...result].sort((a, b) => b.totalPrice - a.totalPrice)
    } else if (sortBy === 'rating_desc') {
      result = [...result].sort((a, b) => {
        const rA = a.room.avgRating ?? estimateRating(getRoomId(a.room))
        const rB = b.room.avgRating ?? estimateRating(getRoomId(b.room))
        return rB - rA
      })
    } else if (sortBy === 'capacity_desc') {
      result = [...result].sort((a, b) => (b.room.capacity ?? 0) - (a.room.capacity ?? 0))
    }

    return result
  }, [displayResults, minPrice, maxPrice, selectedAmenities, minRating, sortBy])

  const resetAllFilters = () => {
    setMinPrice(0)
    setMaxPrice(1500)
    setSelectedAmenities([])
    setMinRating(0)
    setSortBy('default')
  }

  const hasActiveFilters = minPrice > 0 || maxPrice < 1500 || selectedAmenities.length > 0 || minRating > 0;

  const mappedItems: PropertyCardProps[] = filteredResults.map(({ room, totalPrice }) => ({
    id: getRoomId(room),
    image: room.images?.[0] ?? '',
    roomNumber: room.roomNumber ?? 'Phòng',
    roomType: room.roomType?.name ?? 'Khách sạn',
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
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* SEARCH BANNER HEADER */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-12 px-4 sm:px-6 mb-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tìm kiếm kỳ nghỉ thượng lưu</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
            Khám phá & Đặt phòng cao cấp
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mb-8">
            Tìm thấy không gian nghỉ ngơi hoàn hảo với mức giá ưu đãi và dịch vụ đạt chuẩn 5 sao.
          </p>

          <BookingSearchForm
            variant="page"
            onSearch={handleSearch}
            loading={loading}
            className="w-full shadow-xl"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block">
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
              onReset={resetAllFilters}
            />
          </aside>

          {/* MAIN RESULTS SECTION */}
          <section className="min-w-0">
            {/* TOOLBAR & CONTROLS */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Bộ lọc</span>
                </button>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {loading
                      ? t('search.searching', 'Đang tìm kiếm...')
                      : t('search.available', { count: filteredResults.length, defaultValue: `Tìm thấy ${filteredResults.length} phòng khả dụng` })}
                  </p>
                  {searchParams && (
                    <p className="text-xs text-slate-500">
                      {nights} đêm · {searchParams.guests} khách
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                {/* SORT DROPDOWN */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="default">Sắp xếp: Mặc định</option>
                    <option value="price_asc">Giá: Thấp đến Cao</option>
                    <option value="price_desc">Giá: Cao đến Thấp</option>
                    <option value="rating_desc">Đánh giá cao nhất</option>
                    <option value="capacity_desc">Sức chứa nhiều nhất</option>
                  </select>
                </div>

                {/* VIEW SWITCHER */}
                <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setColumns(3)}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      columns === 3 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="3 Cột"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setColumns(2)}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      columns === 2 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="2 Cột rộng"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* MOBILE FILTER DRAWER */}
            {mobileFilterOpen && (
              <div className="lg:hidden mb-6">
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
                  onReset={resetAllFilters}
                />
              </div>
            )}

            {/* ACTIVE FILTERS CHIPS */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <span className="text-xs text-slate-400 font-medium">Bộ lọc đang chọn:</span>
                {(minPrice > 0 || maxPrice < 1500) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                    ${minPrice} - ${maxPrice}
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice(0)
                        setMaxPrice(1500)
                      }}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedAmenities.map((am) => (
                  <span
                    key={am}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold"
                  >
                    {am}
                    <button
                      type="button"
                      onClick={() => setSelectedAmenities(selectedAmenities.filter((a) => a !== am))}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                    ★ {minRating}+ sao
                    <button type="button" onClick={() => setMinRating(0)} className="hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-bold text-rose-500 hover:underline ml-2"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* PROPERTY GRID */}
            <PropertyGrid
              items={mappedItems}
              loading={loading}
              columns={columns === 2 ? 2 : 3}
              emptyMessage={t('search.noResult', 'Không tìm thấy phòng nào phù hợp với bộ lọc hiện tại.')}
            />
          </section>
        </div>
      </div>
    </div>
  )
}

export default RoomsPage