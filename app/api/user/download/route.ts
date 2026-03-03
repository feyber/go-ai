import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { videoId } = await req.json();

    // Find the UserVideo record for this user and video
    const userVideo = await prisma.userVideo.findFirst({
      where: {
        userId: session.user.id,
        videoId: videoId
      }
    });

    if (!userVideo) return NextResponse.json({ error: "Video assignment not found" }, { status: 404 });

    // Update downloadedAt timestamp if not already set
    if (!userVideo.downloadedAt) {
      await prisma.userVideo.update({
        where: { id: userVideo.id },
        data: { downloadedAt: new Date() }
      });
    }

    return NextResponse.json({ success: true, downloadedAt: userVideo.downloadedAt || new Date() });
  } catch (error) {
    console.error("Failed to track download", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
