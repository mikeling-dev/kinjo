import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { serialize } from "cookie";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
      });
    }

    // Create JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set cookie
    const cookie = serialize("token", token, {
      httpOnly: true, // Secure, inaccessible to JS
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400,
      path: "/",
    });

    return new Response(
      JSON.stringify({
        message: "Logged in",
        user: { id: user.id, email, name: user.name },
      }),
      { status: 200, headers: { "Set-Cookie": cookie } }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Login failed" }), {
      status: 500,
    });
  }
}
