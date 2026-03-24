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
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignment: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Failed to fetch videos", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, deleteAll } = await req.json();
    
    if (deleteAll) {
      await prisma.video.deleteMany({});
      return NextResponse.json({ success: true, message: "All videos deleted" });
    }

    if (!id) return NextResponse.json({ error: "Video ID is required" }, { status: 400 });

    await prisma.video.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete video", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
