import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "b5609d25f062fdcc30dd7ed4ed46eda8fcd8ecf37c0ebff0ae48f1e2f7ee5636";

export function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
  } catch (error) {
    return null;
  }
}
