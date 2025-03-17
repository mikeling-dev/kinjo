import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { google } from "googleapis";
import { Readable } from "stream";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI
);
const drive = google.drive({ version: "v3", auth: oauth2Client });

export async function GET(req: NextRequest) {
  const userData = getUserFromToken(req);
  if (!userData)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "");
  if (!id)
    return NextResponse.json({ error: "Listing ID required" }, { status: 400 });

  const listing = await prisma.listing.findUnique({
    where: { id, hostId: userData.userId },
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
      latitude: true,
      longitude: true,
      pricePerNight: true,
      isAlwaysAvailable: true,
      photos: { select: { id: true, photoUrl: true } },
      availabilities: { select: { id: true, startDate: true, endDate: true } },
    },
  });

  if (!listing)
    return NextResponse.json(
      { error: "Listing not found or not yours" },
      { status: 404 }
    );
  return NextResponse.json(listing, { status: 200 });
}

export async function POST(req: NextRequest) {
  const userData = getUserFromToken(req);
  if (!userData)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userData.userId },
    select: { isHost: true },
  });
  if (!user?.isHost)
    return NextResponse.json({ error: "Not a host" }, { status: 403 });

  oauth2Client.setCredentials(JSON.parse(process.env.GOOGLE_DRIVE_TOKEN!));

  const formData = await req.formData();
  const title = formData.get("title") as string;
  const entireUnit = formData.get("entireUnit") === "true";
  const roomRaw = formData.get("room") as string;
  const washroomRaw = formData.get("washroom") as string;
  const capacityRaw = formData.get("capacity") as string;
  const description = formData.get("description") as string | null;
  const locationState = formData.get("locationState") as string | null;
  const locationCountry = formData.get("locationCountry") as string | null;
  const latitudeRaw = formData.get("latitude") as string | null;
  const longitudeRaw = formData.get("longitude") as string | null;
  const pricePerNightRaw = formData.get("pricePerNight") as string;
  const photoFiles = formData.getAll("photos") as File[];
  const excludedDates = JSON.parse(
    (formData.get("excludedDates") as string) || "[]"
  ) as string[];

  // Parse and validate
  const room = parseInt(roomRaw);
  const washroom = parseInt(washroomRaw);
  const capacity = parseInt(capacityRaw);
  const latitude = latitudeRaw ? parseFloat(latitudeRaw) : null;
  const longitude = longitudeRaw ? parseFloat(longitudeRaw) : null;
  const pricePerNight = parseFloat(pricePerNightRaw);

  if (
    !title ||
    isNaN(room) ||
    isNaN(washroom) ||
    isNaN(capacity) ||
    isNaN(pricePerNight)
  ) {
    return NextResponse.json(
      { error: "Required fields missing or invalid" },
      { status: 400 }
    );
  }

  // Upload photos to Google Drive and get URLs
  const photoUrls = await Promise.all(
    photoFiles.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const stream = Readable.from(buffer);

      const { data } = await drive.files.create({
        requestBody: {
          name: `${Date.now()}-${file.name}`,
          mimeType: file.type,
        },
        media: { body: stream },
      });

      await drive.permissions.create({
        fileId: data.id!,
        requestBody: { role: "reader", type: "anyone" },
      });

      return `https://drive.google.com/uc?id=${data.id}`;
    })
  );

  try {
    const listing = await prisma.listing.create({
      data: {
        hostId: userData.userId,
        title,
        entireUnit,
        room,
        washroom,
        capacity,
        description,
        locationState,
        locationCountry,
        latitude,
        longitude,
        pricePerNight,
        isAlwaysAvailable: excludedDates.length === 0,
        photos: {
          create: photoUrls.map((photoUrl) => ({ photoUrl })),
        },
        availabilities: {
          create: excludedDates.map((date) => ({
            startDate: new Date(date),
            endDate: new Date(date),
          })),
        },
      },
    });

    return NextResponse.json(
      { message: "Listing created", listing },
      { status: 201 }
    );
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json(
      { error: "Failed to create listing", details: error },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const userData = getUserFromToken(req);
  if (!userData)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "");
  if (!id)
    return NextResponse.json({ error: "Listing ID required" }, { status: 400 });

  const formData = await req.formData();
  const title = formData.get("title") as string;
  const entireUnit = formData.get("entireUnit") === "on";
  const room = parseInt(formData.get("room") as string);
  const washroom = parseInt(formData.get("washroom") as string);
  const capacity = parseInt(formData.get("capacity") as string);
  const description = formData.get("description") as string | null;
  const locationState = formData.get("locationState") as string | null;
  const locationCountry = formData.get("locationCountry") as string | null;
  const latitudeRaw = formData.get("latitude") as string | null;
  const longitudeRaw = formData.get("longitude") as string | null;
  const pricePerNight = parseFloat(formData.get("pricePerNight") as string);
  const photos = JSON.parse(formData.get("photos") as string) as {
    id: number;
    photoUrl: string;
  }[];
  const excludedDates = JSON.parse(
    (formData.get("excludedDates") as string) || "[]"
  ) as string[];

  if (
    !title ||
    isNaN(room) ||
    isNaN(washroom) ||
    isNaN(capacity) ||
    isNaN(pricePerNight)
  ) {
    return NextResponse.json(
      { error: "Required fields missing or invalid" },
      { status: 400 }
    );
  }

  const latitude = latitudeRaw ? parseFloat(latitudeRaw) : null;
  const longitude = longitudeRaw ? parseFloat(longitudeRaw) : null;

  const listing = await prisma.listing.update({
    where: { id, hostId: userData.userId },
    data: {
      title,
      entireUnit,
      room,
      washroom,
      capacity,
      description,
      locationState,
      locationCountry,
      latitude,
      longitude,
      pricePerNight,
      isAlwaysAvailable: excludedDates.length === 0,
      photos: {
        deleteMany: {}, // Clear existing photos
        create: photos.map((photo) => ({
          id: photo.id,
          photoUrl: photo.photoUrl,
        })), // Recreate in new order
      },
      availabilities: {
        deleteMany: {}, // Clear existing availabilities
        create: excludedDates.map((date) => ({
          startDate: new Date(date),
          endDate: new Date(date),
        })),
      },
    },
  });

  return NextResponse.json(
    { message: "Listing updated", listing },
    { status: 200 }
  );
}

export async function DELETE(req: NextRequest) {
  const userData = getUserFromToken(req);
  if (!userData)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "");
  if (!id) NextResponse.json({ error: "Listing ID required" }, { status: 400 });

  const listing = await prisma.listing.findUnique({
    where: { id, hostId: userData.userId },
  });
  if (!listing)
    return NextResponse.json(
      { error: "Listing not found or not yours" },
      { status: 404 }
    );
  await prisma.listing.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Listing deleted" }, { status: 200 });
}
