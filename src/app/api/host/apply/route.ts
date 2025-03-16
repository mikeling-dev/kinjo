import { getUserFromToken } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const userData = getUserFromToken(req);
  if (!userData) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { fullName, contactInfo, bankAccount, bankName } = await req.json();
    if (!fullName || !contactInfo || !bankAccount || !bankName) {
      return NextResponse.json(
        { error: "Application information required" },
        { status: 400 }
      );
    }

    const existingApplication = await prisma.hostApplication.findUnique({
      where: { userId: userData.userId },
    });
    if (existingApplication) {
      return NextResponse.json(
        { error: "Application already submitted" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userData.userId },
    });
    if (user?.isHost) {
      return NextResponse.json(
        { error: "You are already a host" },
        { status: 400 }
      );
    }

    const application = await prisma.hostApplication.create({
      data: {
        userId: userData.userId,
        fullName,
        contactInfo,
        bankAccount,
        bankName,
        status: "approved", // Approve by submission for now, can change to manual review or setup review api in future
      },
    });

    // const hostStatus = await prisma.user.update({
    //   data: {
    //     isHost: true
    //   }
    // })
    return NextResponse.json(
      { message: "Application submitted", application },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting application: ", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
