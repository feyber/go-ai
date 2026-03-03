import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const history = await prisma.userVideo.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            whatsapp: true,
            tiktok: true
          }
        },
        video: {
          select: {
            url: true
          }
        }
      },
      orderBy: {
        assignedDate: 'desc'
      }
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Failed to fetch history", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
