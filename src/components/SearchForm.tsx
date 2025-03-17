"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useSearch } from "@/lib/SearchContext";

interface SearchFormProps {
  onSearch: () => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const { setSearchParams } = useSearch();
  const [place, setPlace] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [rooms, setRooms] = useState<number | undefined>(undefined);
  const [guests, setGuests] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      place,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      rooms,
      guests,
      startDate,
      endDate,
    });
    onSearch(); // Close drawer
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-semibold">Where</label>
        <Input
          placeholder="Search destinations"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-semibold">Price Range (per night)</label>
        <Slider
          min={0}
          max={1000}
          step={10}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          className="mt-2"
        />
        <div className="flex justify-between mt-1">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
      <div>
        <label className="block font-semibold">Rooms</label>
        <Input
          type="number"
          min={1}
          value={rooms || ""}
          onChange={(e) =>
            setRooms(e.target.value ? parseInt(e.target.value) : undefined)
          }
          placeholder="Any"
        />
      </div>
      <div>
        <label className="block font-semibold">Guests</label>
        <Input
          type="number"
          min={1}
          value={guests || ""}
          onChange={(e) =>
            setGuests(e.target.value ? parseInt(e.target.value) : undefined)
          }
          placeholder="Any"
        />
      </div>
      <div>
        <label className="block font-semibold">Check-in</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              {startDate ? format(startDate, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <label className="block font-semibold">Check-out</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              {endDate ? format(endDate, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
          </PopoverContent>
        </Popover>
      </div>
      <Button type="submit" className="w-full">
        Search
      </Button>
    </form>
  );
}
