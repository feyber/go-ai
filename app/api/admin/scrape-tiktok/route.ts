import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeTikTokStats } from "@/lib/tiktokScraper";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all UserVideos that have a tiktokUrl
    const videosWithUrls = await prisma.userVideo.findMany({
      where: {
        tiktokUrl: { not: null }
      }
    });

    if (videosWithUrls.length === 0) {
      return NextResponse.json({ success: true, message: "No TikTok URLs to scrape", updatedCount: 0, total: 0 });
    }

    let updatedCount = 0;

    // Scrape and update stats (simplistic loop, in production consider batching/rate-limiting)
    for (const video of videosWithUrls) {
      if (video.tiktokUrl) {
        const stats = await scrapeTikTokStats(video.tiktokUrl);
        if (stats) {
          await prisma.userVideo.update({
            where: { id: video.id },
            data: {
              views: stats.views,
              likes: stats.likes,
              comments: stats.comments,
              bookmarks: stats.bookmarks,
              shares: stats.shares,
              lastScrapedAt: new Date()
            }
          });
          updatedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, updatedCount, total: videosWithUrls.length });
  } catch (error) {
    console.error("Failed to bulk scrape TikTok stats", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
