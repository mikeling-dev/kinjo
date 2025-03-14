import { serialize } from "cookie";

export async function GET() {
  const cookie = serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: -1, // Expire immediately
    path: "/",
  });

  return new Response(JSON.stringify({ message: "Logged out" }), {
    status: 200,
    headers: { "Set-Cookie": cookie },
  });
}
