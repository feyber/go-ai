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
    dateFilter = { createdAt: { gte: startOfDay(now) } };
  } else if (filter === "weekly") {
    dateFilter = { createdAt: { gte: subWeeks(now, 1) } };
  } else if (filter === "monthly") {
    dateFilter = { createdAt: { gte: subMonths(now, 1) } };
  } else if (filter === "yearly") {
    dateFilter = { createdAt: { gte: subYears(now, 1) } };
  }

  try {
    // Fetch all user videos with user info
    const posts = await prisma.tikTokPost.findMany({
      where: {
        ...dateFilter
      },
      include: {
        user: {
          select: { email: true, tiktok: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group by user
    const groupedData: any = {};

    posts.forEach(post => {
      const email = post.user.email || "Unknown";
      if (!groupedData[email]) {
        groupedData[email] = {
          userEmail: email,
          tiktokUsername: post.user.tiktok,
          totalViews: 0,
          totalLinks: 0,
          videos: []
        };
      }

      groupedData[email].videos.push({
        id: post.id,
        videoId: post.id,
        assignedDate: post.createdAt.toISOString().split('T')[0],
        tiktokUrl: post.url,
        views: post.views,
        likes: post.likes,
        comments: post.comments,
        bookmarks: post.bookmarks,
        shares: post.shares
      });

      if (post.url) {
        groupedData[email].totalLinks += 1;
        groupedData[email].totalViews += (post.views || 0);
      }
    });

    const result = Object.values(groupedData);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to fetch admin tiktok stats", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
