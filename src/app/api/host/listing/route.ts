// app/api/host/listing/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { google } from "googleapis";
import { Readable } from "stream";

const prisma = new PrismaClient();
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI
);
const drive = google.drive({ version: "v3", auth: oauth2Client });

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
  //   const entireUnit = formData.get("entireUnit") === "true";
  const room = parseInt(formData.get("room") as string);
  const washroom = parseInt(formData.get("washroom") as string);
  const capacity = parseInt(formData.get("capacity") as string);
  const description = formData.get("description") as string | null;
  const locationState = formData.get("locationState") as string | null;
  const locationCountry = formData.get("locationCountry") as string | null;
  const latitude = formData.get("latitude")
    ? parseFloat(formData.get("latitude") as string)
    : null;
  const longitude = formData.get("longitude")
    ? parseFloat(formData.get("longitude") as string)
    : null;
  const pricePerNight = parseFloat(formData.get("pricePerNight") as string);
  const photoFiles = formData.getAll("photos") as File[];
  const excludedDates = JSON.parse(
    (formData.get("excludedDates") as string) || "[]"
  ) as string[];

  if (!title || !room || !washroom || !capacity || !pricePerNight) {
    return NextResponse.json(
      { error: "Required fields missing" },
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

      // Make file publicly accessible and get URL
      await drive.permissions.create({
        fileId: data.id!,
        requestBody: { role: "reader", type: "anyone" },
      });

      return `https://drive.google.com/uc?id=${data.id}`;
    })
  );

  const listing = await prisma.listing.create({
    data: {
      hostId: userData.userId,
      title,
      //   entireUnit,
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
}

// Keep existing GET handler
