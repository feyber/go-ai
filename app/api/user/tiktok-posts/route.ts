import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeTikTokStats } from "@/lib/tiktokScraper";

// POST = Submit new TikTok URL
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { tiktokUrl, turnstileToken } = await req.json();

    if (!turnstileToken) {
      return NextResponse.json({ error: "Security check required" }, { status: 400 });
    }

    // Verify Turnstile Token
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return NextResponse.json({ error: "Security check failed" }, { status: 400 });
    }

    if (!tiktokUrl || !tiktokUrl.includes("tiktok.com")) {
      return NextResponse.json({ error: "Invalid TikTok URL" }, { status: 400 });
    }

    // Scrape stats
    const stats = await scrapeTikTokStats(tiktokUrl);

    // Create a new TikTokPost record
    const post = await prisma.tikTokPost.create({
      data: {
        userId: session.user.id,
        url: tiktokUrl,
        views: stats?.views || 0,
        likes: stats?.likes || 0,
        comments: stats?.comments || 0,
        bookmarks: stats?.bookmarks || 0,
        shares: stats?.shares || 0,
        scrapedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Failed to submit TikTok post", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET = Fetch all user's TikTok posts
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const posts = await prisma.tikTokPost.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Failed to fetch TikTok posts", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
