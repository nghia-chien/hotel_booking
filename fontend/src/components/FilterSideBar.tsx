import { Wifi, Tv, Wind, Coffee, Waves, Dumbbell, Star } from "lucide-react";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";

interface FilterSidebarProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  selectedAmenities: string[];
  onAmenitiesChange: (values: string[]) => void;
  minRating: number;
  onMinRatingChange: (value: number) => void;
}

export function FilterSidebar({
  minPrice,
  maxPrice,
  onPriceChange,
  selectedAmenities,
  onAmenitiesChange,
  minRating,
  onMinRatingChange
}: FilterSidebarProps) {
  const amenities = [
    { id: "wifi", label: "Free WiFi", icon: Wifi },
    { id: "tv", label: "Smart TV", icon: Tv },
    { id: "ac", label: "Air Conditioning", icon: Wind },
    { id: "coffee", label: "Coffee Maker", icon: Coffee },
    { id: "pool", label: "Pool Access", icon: Waves },
    { id: "gym", label: "Gym Access", icon: Dumbbell }
  ];

  const ratings = [5, 4, 3];

  const handlePriceChange = (values: number[]) => {
    if (values.length === 2) {
      onPriceChange(values[0], values[1]);
    }
  };

  const toggleAmenity = (id: string) => {
    onAmenitiesChange(
      selectedAmenities.includes(id)
        ? selectedAmenities.filter((a) => a !== id)
        : [...selectedAmenities, id]
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8DFD8] sticky top-8">
      <h2 className="mb-6 text-[#2C2C2C]">Filters</h2>

      {/* Price Range */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm text-[#2C2C2C]">Price Range</label>
          <span className="text-sm text-[#666666]">
            ${minPrice} - ${maxPrice}
          </span>
        </div>
        <Slider
          value={[minPrice, maxPrice]}
          onValueChange={handlePriceChange}
          min={50}
          max={3000}
          step={50}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-[#999999]">
          <span>$50</span>
          <span>$3000</span>
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-8">
        <label className="block mb-4 text-sm text-[#2C2C2C]">Amenities</label>
        <div className="space-y-3">
          {amenities.map((amenity) => {
            const Icon = amenity.icon;
            return (
              <div key={amenity.id} className="flex items-center gap-3">
                <Checkbox
                  id={amenity.id}
                  checked={selectedAmenities.includes(amenity.id)}
                  onCheckedChange={() => toggleAmenity(amenity.id)}
                />
                <label
                  htmlFor={amenity.id}
                  className="flex items-center gap-2 text-sm text-[#2C2C2C] cursor-pointer"
                >
                  <Icon className="h-4 w-4 text-[#666666]" />
                  {amenity.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guest Ratings */}
      <div>
        <label className="block mb-4 text-sm text-[#2C2C2C]">Guest Rating</label>
        <div className="space-y-2">
          {ratings.map((rating) => (
            <button
              key={rating}
              onClick={() =>
                onMinRatingChange(minRating === rating ? 0 : rating)
              }
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                minRating === rating
                  ? "bg-[#2C2C2C] text-white border-[#2C2C2C]"
                  : "bg-[#F5F1ED] text-[#2C2C2C] border-[#E8DFD8] hover:bg-[#E8DFD8]"
              }`}
            >
              <Star
                className={`h-4 w-4 ${
                  minRating === rating ? "fill-white" : "fill-[#FFD700]"
                }`}
              />
              <span className="text-sm">{rating}+ Stars</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
