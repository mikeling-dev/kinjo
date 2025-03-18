import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    // Check if email already exists
    const exisitingUser = await prisma.user.findUnique({ where: { email } });
    if (exisitingUser) {
      return NextResponse.json(
        { error: "Email already in use, please log in instead." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Generate token to sign user in after creating user
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });

    // Create the response first
    const response = NextResponse.json(
      {
        message: "User created and logged in",
        user: { id: user.id, email, name },
      },
      { status: 201 }
    );

    // Set the cookie
    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
