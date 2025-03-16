// app/api/auth/google-drive-callback/route.ts
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code)
    return NextResponse.json({ error: "No code provided" }, { status: 400 });

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Save tokens to .env (manual step for now; use a secure store in production)
  await fs.appendFile(".env", `\nGOOGLE_DRIVE_TOKEN=${JSON.stringify(tokens)}`);
  return NextResponse.json({
    message: "Token saved, update your .env manually",
  });
}
