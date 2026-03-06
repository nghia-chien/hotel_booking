import { useState } from "react";
import { Calendar as CalendarIcon, Users, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import "react-day-picker/style.css";
interface SearchBarProps {
  onSearch: (params: {
    checkIn?: Date;
    checkOut?: Date;
    guests: number;
  }) => void;
  loading?: boolean;
}

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [guestsOpen, setGuestsOpen] = useState(false);

  const handleGuestChange = (change: number) => {
    setGuests((prev) => Math.max(1, Math.min(10, prev + change)));
  };

  const handleSearchClick = () => {
    onSearch({ checkIn, checkOut, guests });
  };

  return (
    <div className="bg-white shadow-sm border border-[#E8DFD8] rounded-2xl p-6 mx-auto max-w-5xl">
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Check-in Date */}
        <div className="flex-1 w-full">
          <label className="block mb-2 text-sm text-[#2C2C2C]">Check-in</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-[#F5F1ED] border-[#E8DFD8] hover:bg-[#E8DFD8] h-12"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#2C2C2C]" />
                <span className="text-[#2C2C2C]">
                  {checkIn ? format(checkIn, "MMM dd, yyyy HH:mm") : "Select date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                value={checkIn}
                onChange={(date) => {
                  setCheckIn(date);
                  if (checkOut && date && checkOut <= date) {
                    setCheckOut(undefined);
                  }
                }}
                minDateTime={new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out Date */}
        <div className="flex-1 w-full">
          <label className="block mb-2 text-sm text-[#2C2C2C]">Check-out</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-[#F5F1ED] border-[#E8DFD8] hover:bg-[#E8DFD8] h-12"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#2C2C2C]" />
                <span className="text-[#2C2C2C]">
                  {checkOut ? format(checkOut, "MMM dd, yyyy HH:mm") : "Select date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                value={checkOut}
                onChange={setCheckOut}
                minDateTime={checkIn}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="flex-1 w-full">
          <label className="block mb-2 text-sm text-[#2C2C2C]">Guests</label>
          <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-[#F5F1ED] border-[#E8DFD8] hover:bg-[#E8DFD8] h-12"
              >
                <Users className="mr-2 h-4 w-4 text-[#2C2C2C]" />
                <span className="text-[#2C2C2C]">
                  {guests} {guests === 1 ? "Guest" : "Guests"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#2C2C2C]">Guests</span>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleGuestChange(-1)}
                      disabled={guests <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{guests}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleGuestChange(1)}
                      disabled={guests >= 10}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full bg-[#2C2C2C] hover:bg-[#3A3A3A] text-white"
                  onClick={() => setGuestsOpen(false)}
                >
                  Done
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Button */}
        <div className="pt-7 w-full md:w-auto">
          <Button
            className="h-12 px-8 bg-[#2C2C2C] hover:bg-[#3A3A3A] text-white w-full"
            onClick={handleSearchClick}
            disabled={loading}
          >
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
    </div>
  );
}
