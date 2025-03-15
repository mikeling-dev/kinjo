import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const prisma = new PrismaClient();
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "b5609d25f062fdcc30dd7ed4ed46eda8fcd8ecf37c0ebff0ae48f1e2f7ee5636";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code"); // Query encoded paramaters from url

  if (!code) NextResponse.json({ error: "No code provided" }, { status: 400 });
  // Return json object containing access_token, required to fetch user profile from google
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: code!,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: "http://localhost:3000/api/auth/google/callback",
      grant_type: "authorization_code",
    }),
  });

  // Parse tokenResponse to javascript object
  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token)
    NextResponse.json({ error: "Failed to get access token" }, { status: 400 });

  // fetch user profile from google api using the access_token returned above
  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    }
  );
  const userData = await userResponse.json();

  const { id: googleId, email, name } = userData;

  let user;

  // check if user has existing account registered with email
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    // Scenario 1: user registered with email before, but never linked google account
    if (!existingUser.googleId) {
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: { googleId },
      });
    } else {
      user = existingUser; //Scenario 2: user logged in with google account before
    }
  } else {
    // User never registered before
    user = await prisma.user.create({
      data: { googleId, email, name },
    });
  }

  // generate token for login

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "24h",
  });
  const cookie = serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 86400,
    path: "/",
  });

  return NextResponse.redirect("http://localhost:3000/", {
    headers: { "Set-Cookie": cookie },
  });
}
