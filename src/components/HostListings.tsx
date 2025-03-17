"use client";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import SkeletonListingCard from "./SkeletonListingCard";
import Link from "next/link";
import Image from "next/image";

interface Listing {
  id: number;
  title: string;
  locationState: string;
  locationCountry: string;
  pricePerNight: number;
  entireUnit: boolean;
  room: number;
  washroom: number;
  capacity: number;
  createdAt: string;
  photos: { id: number; photoUrl: string }[];
}

export default function HostListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isHost) {
      fetch("/api/host/listings")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch listings");
          return res.json();
        })
        .then((data: Listing[]) => {
          setListings(data);
          setTimeout(() => setLoading(false), 300);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user)
    return (
      <div className="px-4 py-6">
        <p>Please log in to access this page</p>
      </div>
    );
  if (loading)
    return (
      <div>
        <div className="flex flex-row justify-between w-full px-4">
          <p className="font-semibold mb-3">Current Listings:</p>
          <Button className="rounded-full h-7 px-3 text-xs">
            + Add listing
          </Button>
        </div>
        <div className="flex flex-row gap-5 overflow-x-clip px-4 pb-10">
          <SkeletonListingCard />
          <SkeletonListingCard />
          <SkeletonListingCard />
          <SkeletonListingCard />
          <SkeletonListingCard />
          <SkeletonListingCard />
        </div>
      </div>
    );

  return (
    <div>
      <div className="flex flex-row justify-between w-full px-4 mb-3">
        <p className="font-semibold">Current Listings {listings.length}:</p>
        <Link href="/host/listing_form">
          <Button className="rounded-full h-7 px-3 text-xs">
            + Add listing
          </Button>
        </Link>
      </div>
      <div className="flex flex-row gap-5 overflow-x-scroll pb-10 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {listings.length === 0 ? (
          <p>No listings yet. Add one!</p>
        ) : (
          listings.map((listing) => (
            <Card
              key={listing.id}
              className="w-60 min-w-60 rounded-xl shadow-lg"
            >
              <Image
                src={listing.photos[0]?.photoUrl || "/placeholder-image.jpg"}
                alt={listing.title}
                width={400}
                height={300}
                className="w-full h-36 rounded-t-md object-cover"
              />
              <div className="p-3 text-xs">
                <h2 className="text-base font-semibold">
                  {listing.title} in {listing.locationState}
                </h2>
                <p>${listing.pricePerNight} / night</p>
                <p>
                  {listing.entireUnit ? "Entire Unit" : "Shared Unit"} in{" "}
                  {listing.locationCountry}
                </p>
                <p>
                  {listing.capacity} Guests, {listing.room} Rooms,{" "}
                  {listing.washroom} Baths
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
