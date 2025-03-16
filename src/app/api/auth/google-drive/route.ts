import { google } from "googleapis";
import { NextResponse } from "next/server";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI
);

export async function GET() {
  const authUrl = oauth2Client.generateAuthUrl({
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });
  return NextResponse.redirect(authUrl);
}
