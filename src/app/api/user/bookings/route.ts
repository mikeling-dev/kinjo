import { getUserFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userData = getUserFromToken(req);
  if (!userData)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: { userId: userData.userId },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      guests: true,
      totalPrice: true,
      createdAt: true,
      listing: {
        select: {
          id: true,
          title: true,
          photos: {
            select: { photoUrl: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bookings, { status: 200 });
}
