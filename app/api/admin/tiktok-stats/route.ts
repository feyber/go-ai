import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, subWeeks, subMonths, subYears, startOfDay } from "date-fns";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "all";

  let dateFilter = {};
  const now = new Date();

  // Basic date filtering based on assignment date or downloaded date
  // Note: assignedDate is YYYY-MM-DD string, so filtering by it requires string comparison
  // For simplicity and accuracy with time filters, we'll filter by downloadedAt or createdAt
  if (filter === "daily") {
    dateFilter = { downloadedAt: { gte: startOfDay(now) } };
  } else if (filter === "weekly") {
    dateFilter = { downloadedAt: { gte: subWeeks(now, 1) } };
  } else if (filter === "monthly") {
    dateFilter = { downloadedAt: { gte: subMonths(now, 1) } };
  } else if (filter === "yearly") {
    dateFilter = { downloadedAt: { gte: subYears(now, 1) } };
  }

  try {
    // Fetch all user videos with user info
    const userVideos = await prisma.userVideo.findMany({
      where: {
        ...dateFilter
      },
      include: {
        user: {
          select: { email: true, tiktok: true }
        }
      },
      orderBy: {
        assignedDate: 'desc'
      }
    });

    // Group by user
    const groupedData: any = {};

    userVideos.forEach(uv => {
      const email = uv.user.email || "Unknown";
      if (!groupedData[email]) {
        groupedData[email] = {
          userEmail: email,
          tiktokUsername: uv.user.tiktok,
          totalViews: 0,
          totalLinks: 0,
          videos: []
        };
      }

      groupedData[email].videos.push({
        id: uv.id,
        videoId: uv.videoId,
        assignedDate: uv.assignedDate,
        tiktokUrl: uv.tiktokUrl,
        views: uv.views,
        likes: uv.likes,
        comments: uv.comments,
        bookmarks: uv.bookmarks,
        shares: uv.shares
      });

      if (uv.tiktokUrl) {
        groupedData[email].totalLinks += 1;
        groupedData[email].totalViews += (uv.views || 0);
      }
    });

    const result = Object.values(groupedData);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to fetch admin tiktok stats", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
