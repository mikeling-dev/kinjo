"use client";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import SkeletonListingCard from "./SkeletonListingCard";

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
  photo: { id: number; photoUrl: string } | null;
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
          setLoading(false);
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
      <div className="flex flex-row justify-between w-full px-4">
        <p className="font-semibold mb-3">
          Current Listings {listings.length}:
        </p>
        <Button className="rounded-full h-7 px-3 text-xs">+ Add listing</Button>
      </div>
      <div className="flex flex-row gap-5 overflow-x-scroll pb-10 px-4">
        {listings.length === 0 ? (
          <p>No listings yet. Add one!</p>
        ) : (
          <Card className="space-y-4">
            {listings.map((listing) => (
              <li key={listing.id} className="p-4 border rounded">
                <h2 className="text-xl">{listing.title}</h2>
                <p>${listing.pricePerNight} / night</p>
                <p>Type: {listing.entireUnit ? "Entire Unit" : "Shared"}</p>
                <p>
                  Rooms: {listing.room}, Washrooms: {listing.washroom}
                </p>
                <p>Capacity: {listing.capacity} guests</p>
              </li>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
