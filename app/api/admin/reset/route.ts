export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check
    const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    const userEmail = session.user.email?.toLowerCase() || "";
    const isSuperAdmin = superAdmins.includes(userEmail) || (session.user as any).role === "ADMIN";

    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { target } = await req.json();

    if (target === 'revenue_data') {
      // Delete all Subscription records to reset earnings and active sub counts
      await prisma.subscription.deleteMany({});
      
      console.log(`ADMIN RESET: User ${userEmail} cleared all revenue and subscription data.`);
      return NextResponse.json({ success: true, message: 'All financial and membership data has been reset.' });
    }

    if (target === 'fonnte_quota') {
      await prisma.setting.upsert({
        where: { key: 'fonnte_reset_date' },
        update: { value: new Date().toISOString() },
        create: { key: 'fonnte_reset_date', value: new Date().toISOString() }
      });
      return NextResponse.json({ success: true, message: 'Fonnte quota tracking has been reset to 1000.' });
    }

    if (target === 'video_pool') {
      // Set all videos back to available
      await prisma.video.updateMany({
        data: { isAssigned: false }
      });
      // Clear user-video assignments
      await prisma.userVideo.deleteMany({});
      
      // Clear PAYG subscriptions
      await prisma.subscription.deleteMany({
        where: { tier: { gte: 10 } }
      });
      
      console.log(`ADMIN RESET: User ${userEmail} reset the entire Video Pool assignments and PAYG subscriptions.`);
      return NextResponse.json({ success: true, message: 'All videos have been reset to Available.' });
    }

    return NextResponse.json({ error: 'Invalid reset target' }, { status: 400 });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Failed to perform reset' }, { status: 500 });
  }
}
