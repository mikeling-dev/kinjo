// import { getUserFromToken } from "@/lib/auth";
// import { PrismaClient } from "@prisma/client";
// import { NextRequest, NextResponse } from "next/server";

// const prisma = new PrismaClient();

// export async function GET(req: NextRequest) {
//   const userData = getUserFromToken(req);
//   if (!userData) {
//     return (
//       NextResponse.json({ error: "Not authenticated" }),
//       {
//         status: 401,
//       }
//     );
//   }

//   const user = await prisma.user.findUnique({
//     where: { id: userData.userId },
//   });
//   if (!user) {
//     return (
//       NextResponse.json({ error: "User not found" }),
//       {
//         status: 404,
//       }
//     );
//   }
//   return (
//     NextResponse.json({ id: user.id, email: user.email, name: user.name }),
//     { status: 200 }
//   );
// }

import { getUserFromToken } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const userData = getUserFromToken(req);
  if (!userData) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userData.userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(
    { id: user.id, email: user.email, name: user.name },
    { status: 200 }
  );
}
