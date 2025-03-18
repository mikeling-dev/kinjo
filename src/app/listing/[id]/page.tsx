"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import Image from "next/image";

interface Listing {
  id: number;
  title: string;
  entireUnit: boolean;
  room: number;
  washroom: number;
  capacity: number;
  description: string | null;
  locationState: string | null;
  locationCountry: string | null;
  pricePerNight: number;
  isAlwaysAvailable: boolean;
  photos: { photoUrl: string }[];
  availabilities: { startDate: string; endDate: string }[];
}

export default function ListingDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState<number>(1);

  useEffect(() => {
    fetch(`/api/listings?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch listing");
        return res.json();
      })
      .then((data: Listing) => {
        setListing(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to book");
      router.push("/"); // Redirect to login
      return;
    }
    if (!startDate || !endDate || guests < 1) {
      alert("Please select dates and number of guests");
      return;
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          guests,
        }),
      });
      if (res.ok) {
        alert("Booking successful!");
        router.push("/profile"); // Redirect to profile or bookings page
      } else {
        const data = await res.json();
        alert(data.error || "Failed to book");
      }
    } catch {
      alert("An error occurred");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!listing) return <div className="p-4">Listing not found.</div>;

  const disabledDates = listing.availabilities
    .filter(() => !listing.isAlwaysAvailable)
    .map((a) => ({ from: new Date(a.startDate), to: new Date(a.endDate) }));

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="grid grid-cols-2 gap-2 mb-4 max-h-96 overflow-auto">
            {listing.photos.map((photo, index) => (
              <Image
                key={index}
                src={photo.photoUrl}
                alt={listing.title}
                width={300}
                height={200}
                className="object-cover rounded-md"
              />
            ))}
          </div>
          <p className="text-muted-foreground mb-2">
            {listing.entireUnit ? "Entire place" : "Private room"} in{" "}
            {listing.locationState}, {listing.locationCountry}
          </p>
          <p>
            {listing.room} {listing.room === 1 ? "room" : "rooms"},{" "}
            {listing.washroom}{" "}
            {listing.washroom === 1 ? "bathroom" : "bathrooms"}, up to{" "}
            {listing.capacity} guests
          </p>
          <p className="mt-4">{listing.description}</p>
        </div>
        <Card className="sticky top-4 h-fit">
          <CardHeader>
            <CardTitle>${listing.pricePerNight} / night</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBook} className="space-y-4">
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
                      disabled={disabledDates}
                      fromDate={new Date()}
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
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={disabledDates}
                      fromDate={startDate || new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block font-semibold">Guests</label>
                <Input
                  type="number"
                  min={1}
                  max={listing.capacity}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                />
              </div>
              <Button type="submit" className="w-full">
                Book Now
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
