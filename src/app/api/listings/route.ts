import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")
    ? parseInt(searchParams.get("id")!)
    : undefined;
  const place = searchParams.get("place") || undefined;
  const minPrice = searchParams.get("minPrice")
    ? parseFloat(searchParams.get("minPrice")!)
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? parseFloat(searchParams.get("maxPrice")!)
    : undefined;
  const rooms = searchParams.get("rooms")
    ? parseInt(searchParams.get("rooms")!)
    : undefined;
  const guests = searchParams.get("guests")
    ? parseInt(searchParams.get("guests")!)
    : undefined;
  const startDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate")!)
    : undefined;
  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate")!)
    : undefined;

  if (id) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        entireUnit: true,
        room: true,
        washroom: true,
        capacity: true,
        description: true,
        locationState: true,
        locationCountry: true,
        pricePerNight: true,
        isAlwaysAvailable: true,
        photos: { select: { photoUrl: true } },
        availabilities: { select: { startDate: true, endDate: true } },
      },
    });
    if (!listing)
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    return NextResponse.json(listing, { status: 200 });
  }

  const listings = await prisma.listing.findMany({
    where: {
      AND: [
        place
          ? {
              OR: [
                { locationState: { contains: place, mode: "insensitive" } },
                { locationCountry: { contains: place, mode: "insensitive" } },
              ],
            }
          : {},
        minPrice ? { pricePerNight: { gte: minPrice } } : {},
        maxPrice ? { pricePerNight: { lte: maxPrice } } : {},
        rooms ? { room: { gte: rooms } } : {},
        guests ? { capacity: { gte: guests } } : {},
        startDate && endDate
          ? {
              availabilities: {
                none: {
                  OR: [
                    {
                      startDate: { lte: endDate },
                      endDate: { gte: startDate },
                    }, // Overlap check
                  ],
                },
              },
              OR: [
                { isAlwaysAvailable: true },
                {
                  availabilities: {
                    some: {
                      startDate: { lte: startDate },
                      endDate: { gte: endDate },
                    },
                  },
                },
              ],
            }
          : {},
      ],
    },
    select: {
      id: true,
      title: true,
      capacity: true,
      room: true,
      washroom: true,
      pricePerNight: true,
      locationState: true,
      locationCountry: true,
      photos: { select: { photoUrl: true }, take: 1 },
    },
  });

  return NextResponse.json(listings, { status: 200 });
}

export async function POST(req: NextRequest) {
  const userData = getUserFromToken(req);
  if (!userData)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { listingId, startDate, endDate, guests } = await req.json();
  if (!listingId || !startDate || !endDate || !guests) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      capacity: true,
      pricePerNight: true,
      isAlwaysAvailable: true,
      availabilities: { select: { startDate: true, endDate: true } },
    },
  });

  if (!listing)
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (guests > listing.capacity)
    return NextResponse.json({ error: "Too many guests" }, { status: 400 });

  const start = new Date(startDate);
  const end = new Date(endDate);
  const unavailable = listing.availabilities.some(
    (a) => new Date(a.startDate) <= end && new Date(a.endDate) >= start
  );
  if (!listing.isAlwaysAvailable && unavailable) {
    return NextResponse.json({ error: "Dates unavailable" }, { status: 400 });
  }

  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = days * Number(listing.pricePerNight);

  const booking = await prisma.booking.create({
    data: {
      userId: userData.userId,
      listingId,
      startDate: start,
      endDate: end,
      guests,
      totalPrice,
    },
  });

  return NextResponse.json(
    { message: "Booking created", booking },
    { status: 201 }
  );
}
