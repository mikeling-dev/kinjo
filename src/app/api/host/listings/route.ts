import { getUserFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userData = getUserFromToken(req);
  if (!userData)
    NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userData?.userId },
    select: { isHost: true },
  });
  if (!user?.isHost)
    NextResponse.json({ error: "Not a host" }, { status: 403 });

  const listings = await prisma.listing.findMany({
    where: { hostId: userData?.userId },
    select: {
      id: true,
      title: true,
      locationState: true,
      locationCountry: true,
      pricePerNight: true,
      entireUnit: true,
      room: true,
      washroom: true,
      capacity: true,
      createdAt: true,
      photos: {
        select: {
          id: true,
          photoUrl: true,
        },
        take: 1,
      },
    },
  });

  return NextResponse.json(listings, { status: 200 });
}
