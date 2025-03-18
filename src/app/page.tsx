"use client";
import { useEffect, useState } from "react";
import { useSearch } from "@/lib/SearchContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import SkeletonListingCard from "@/components/SkeletonListingCard";

interface Listing {
  id: number;
  title: string;
  pricePerNight: number;
  capacity: number;
  room: number;
  washroom: number;
  locationState: string | null;
  locationCountry: string | null;
  photos: { photoUrl: string }[];
}

export default function HomePage() {
  const { searchParams } = useSearch();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      const query = new URLSearchParams({
        ...(searchParams.place && { place: searchParams.place }),
        ...(searchParams.minPrice && {
          minPrice: searchParams.minPrice.toString(),
        }),
        ...(searchParams.maxPrice && {
          maxPrice: searchParams.maxPrice.toString(),
        }),
        ...(searchParams.rooms && { rooms: searchParams.rooms.toString() }),
        ...(searchParams.guests && { guests: searchParams.guests.toString() }),
        ...(searchParams.startDate && {
          startDate: searchParams.startDate.toISOString(),
        }),
        ...(searchParams.endDate && {
          endDate: searchParams.endDate.toISOString(),
        }),
      }).toString();

      const res = await fetch(`/api/listings?${query}`);
      if (!res.ok) throw new Error("Failed to fetch listings");
      const data = await res.json();
      setListings(data);
      setLoading(false);
    };

    fetchListings().catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [searchParams]);

  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <SkeletonListingCard />
        <SkeletonListingCard />
        <SkeletonListingCard />
        <SkeletonListingCard />
        <SkeletonListingCard />
        <SkeletonListingCard />
      </div>
    );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Explore Kinjo Listings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="p-0">
            <CardHeader className="p-0 mb-4">
              <Image
                src={listing.photos[0]?.photoUrl || "/placeholder.jpg"}
                alt={listing.title}
                height={500}
                width={500}
                className="w-full h-48 object-cover rounded-t-md"
              />
            </CardHeader>
            <CardContent className="px-4">
              <CardTitle>{listing.title}</CardTitle>
              <p className="text-muted-foreground">
                {listing.locationState}, {listing.locationCountry}
              </p>
              <p className="font-semibold">${listing.pricePerNight} / night</p>
              <p className="text-muted-foreground">
                {listing.capacity} Guests {listing.room} Rooms{" "}
                {listing.washroom} Bath
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/listing/${listing.id}`}>
                <Button variant="outline">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
