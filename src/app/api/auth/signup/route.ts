import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const prisma = new PrismaClient();
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "b5609d25f062fdcc30dd7ed4ed46eda8fcd8ecf37c0ebff0ae48f1e2f7ee5636";

export async function POST(req: any) {
  try {
    const { email, password, name } = await req.json();

    // Check if email already exists
    const exisitingUser = await prisma.user.findUnique({ where: { email } });
    if (exisitingUser) {
      return new Response(JSON.stringify({ error: "Email already in use" }), {
        status: 400,
      });
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
      maxAge: 86400,
      path: "/",
    });

    return new Response(
      JSON.stringify({
        message: "User created and logged in",
        user: { id: user.id, email, name },
      }),
      { status: 201, headers: { "Set-Cookie": cookie } }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Signup failed" }));
  }
}
