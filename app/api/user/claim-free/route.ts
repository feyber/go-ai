import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { format } from "date-fns-tz";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (user.hasClaimedFreeVideos) {
      return NextResponse.json({ success: false, error: "Kamu sudah pernah klaim video gratis!" }, { status: 400 });
    }

    if (!user.whatsapp) {
      return NextResponse.json({ success: false, error: "Tolong lengkapi nomor WhatsApp di Profil / Settings sebelum klaim." }, { status: 400 });
    }

    // 1. Check if this WhatsApp is already used by someone who claimed
    const existingWaClaim = await prisma.user.findFirst({
      where: {
        whatsapp: user.whatsapp,
        hasClaimedFreeVideos: true,
        id: { not: user.id }
      }
    });

    if (existingWaClaim) {
      return NextResponse.json({ success: false, error: "Nomor WhatsApp ini sudah pernah mengambil video gratis di akun lain." }, { status: 400 });
    }

    // 2. Check IP Address
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || 'unknown-ip');

    // Ignore localhost during dev for simplicity, but track real IPs
    if (process.env.NODE_ENV === "production" && ip !== 'unknown-ip' && ip !== '::1' && ip !== '127.0.0.1') {
      const ipKey = `IP_CLAIM_${ip}`;
      const existingIpClaim = await prisma.setting.findUnique({
        where: { key: ipKey }
      });
      if (existingIpClaim) {
        return NextResponse.json({ success: false, error: "Jaringan internet/Wifi ini sudah pernah melakukan klaim. (1 IP = 1 Klaim)." }, { status: 400 });
      }
    }

    // 3. Assign 3 unassigned videos (try matching category only if Ultimate)
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'completed',
        expiresAt: { gt: new Date() }
      },
      orderBy: { startedAt: 'desc' }
    });

    const isUltimate = subscription?.tier === 3;
    let videosToAssign: any[] = [];

    if (isUltimate && user.videoCategory) {
      videosToAssign = await prisma.video.findMany({
        where: { isAssigned: false, category: user.videoCategory },
        take: 3,
        orderBy: { createdAt: 'asc' }
      });
    }

    // Fallback if not Ultimate, no category, or not enough videos in category
    if (videosToAssign.length < 3) {
      const additionalNeeded = 3 - videosToAssign.length;
      const additionalVideos = await prisma.video.findMany({
        where: { 
          isAssigned: false,
          id: { notIn: videosToAssign.map(v => v.id) }
        },
        take: additionalNeeded,
        orderBy: { createdAt: 'asc' }
      });
      videosToAssign = [...videosToAssign, ...additionalVideos];
    }

    if (videosToAssign.length < 3) {
      return NextResponse.json({ success: false, error: "Maaf, stok video gratis admin sedang kosong/kurang! Mohon tunggu admin mengisi stok." }, { status: 400 });
    }

    // 4. Create assignments transaction
    const todayStr = format(new Date(), "yyyy-MM-dd", { timeZone: "Asia/Jakarta" });
    
    await prisma.$transaction(async (tx) => {
      for (const video of videosToAssign) {
        // Mark as assigned
        await tx.video.update({
          where: { id: video.id },
          data: { isAssigned: true }
        });
        
        // Create user-video map
        await tx.userVideo.create({
          data: {
            userId: user.id,
            videoId: video.id,
            assignedDate: todayStr
          }
        });
      }
      
      // Update User flag
      await tx.user.update({
        where: { id: user.id },
        data: { hasClaimedFreeVideos: true }
      });

      // Log IP
      if (process.env.NODE_ENV === "production" && ip !== 'unknown-ip' && ip !== '::1' && ip !== '127.0.0.1') {
        const ipKey = `IP_CLAIM_${ip}`;
        await tx.setting.upsert({
          where: { key: ipKey },
          update: { value: new Date().toISOString() },
          create: { key: ipKey, value: new Date().toISOString() }
        });
      }
    });

    return NextResponse.json({ success: true, message: "Klaim 3 video gratis sukses!" });
  } catch (error: any) {
    console.error("Free claim error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan sistem saat klaim." }, { status: 500 });
  }
}
