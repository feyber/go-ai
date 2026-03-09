import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeTikTokStats } from "@/lib/tiktokScraper";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { videoId, tiktokUrl } = await req.json();

    if (!videoId || !tiktokUrl) {
      return NextResponse.json({ error: "Missing videoId or tiktokUrl" }, { status: 400 });
    }

    // Basic TikTok URL validation
    if (!tiktokUrl.includes("tiktok.com")) {
      return NextResponse.json({ error: "Invalid TikTok URL" }, { status: 400 });
    }

    // Find the UserVideo record
    const userVideo = await prisma.userVideo.findFirst({
      where: {
        userId: session.user.id,
        videoId: videoId
      }
    });

    if (!userVideo) return NextResponse.json({ error: "Video assignment not found" }, { status: 404 });

    // Scrape initial stats
    const stats = await scrapeTikTokStats(tiktokUrl);

    // Update the record with URL and stats
    await prisma.userVideo.update({
      where: { id: userVideo.id },
      data: {
        tiktokUrl,
        lastScrapedAt: new Date(),
        ...(stats ? {
          views: stats.views,
          likes: stats.likes,
          comments: stats.comments,
          bookmarks: stats.bookmarks,
          shares: stats.shares
        } : {})
      }
    });

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Failed to submit TikTok URL", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
