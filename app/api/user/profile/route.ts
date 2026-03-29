import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { whatsapp, tiktok, videoCategory } = await req.json();

    // 1. Check active subscription tier
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'completed',
        expiresAt: { gt: new Date() }
      },
      orderBy: { startedAt: 'desc' }
    });

    const isUltimate = subscription?.tier === 3;

    // 2. Clean strings just in case
    const safeWhatsapp = whatsapp ? String(whatsapp).trim() : null;
    const safeTiktok = tiktok ? String(tiktok).trim() : null;
    
    // Only allow category if Ultimate, otherwise clear it (auto-random logic)
    const safeCategory = (isUltimate && videoCategory) ? String(videoCategory).trim() : null;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        whatsapp: safeWhatsapp,
        tiktok: safeTiktok,
        videoCategory: safeCategory
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Failed to update profile", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
