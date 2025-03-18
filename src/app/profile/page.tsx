"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  createdAt: string;
  listing: {
    id: number;
    title: string;
    photos: { photoUrl: string }[];
  };
}

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    fetch("/api/user/bookings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bookings");
        return res.json();
      })
      .then((data: Booking[]) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [user, router]);

  if (!user) return null; // Redirect to home page
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-muted-foreground">
          You haven’t booked anything yet.
        </p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Image
                  src={
                    booking.listing.photos[0]?.photoUrl || "/placeholder.jpg"
                  }
                  alt={booking.listing.title}
                  width={100}
                  height={100}
                  className="object-cover rounded-md"
                />
                <div>
                  <CardTitle>{booking.listing.title}</CardTitle>
                  <p className="text-muted-foreground">
                    Booked on {format(new Date(booking.createdAt), "PPP")}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Stay:</strong>{" "}
                  {format(new Date(booking.startDate), "PPP")} -{" "}
                  {format(new Date(booking.endDate), "PPP")}
                </p>
                <p>
                  <strong>Guests:</strong> {booking.guests}
                </p>
                <p>
                  <strong>Total Price:</strong> ${booking.totalPrice}
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => router.push(`/listing/${booking.listing.id}`)}
                >
                  View Listing
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
