export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
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

    // Global Stats Aggregation
    const totalUsers = await prisma.user.count();
    const activeSubscribers = await prisma.subscription.count({
      where: {
        status: 'completed',
        expiresAt: { gt: new Date() }
      }
    });

    // Total All-Time Revenue calculation
    const revenueAggAll = await prisma.subscription.aggregate({
      _sum: { amount: true },
      where: { status: 'completed' }
    });
    const totalRevenue = revenueAggAll._sum.amount || 0;

    // Filtered Revenue calculation
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'all';
    
    let startDate: Date | undefined;
    if (period === 'daily') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // Start of today
    } else if (period === 'weekly') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    const revenueAggFiltered = await prisma.subscription.aggregate({
      _sum: { amount: true },
      where: { 
        status: 'completed',
        ...(startDate ? { startedAt: { gte: startDate } } : {})
      }
    });
    const filteredRevenue = revenueAggFiltered._sum.amount || 0;

    // Video Stats
    const totalVideosPool = await prisma.video.count();
    const availableVideos = await prisma.video.count({ where: { isAssigned: false } });
    const assignedVideos = await prisma.video.count({ where: { isAssigned: true } });

    // Detailed User List for the Table
    const users = await prisma.user.findMany({
      include: {
        subscriptions: {
          orderBy: { startedAt: 'desc' },
        }
      }
    });

    const userDetails = users.map(user => {
      const activeSub = user.subscriptions.find(s => s.status === 'completed' && s.expiresAt > new Date());
      const totalPaid = user.subscriptions
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + s.amount, 0);
      
      const paygCount = user.subscriptions.filter(s => s.status === 'completed' && s.orderId.startsWith('PAYG_')).length;

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.subscriptions.length > 0 ? user.subscriptions[user.subscriptions.length - 1].startedAt : null,
        activeTier: activeSub ? activeSub.tier : 0,
        expiresAt: activeSub ? activeSub.expiresAt : null,
        totalPaid,
        paygPurchases: paygCount
      };
    });

    // Fonnte API Quota tracking
    const resetSetting = await prisma.setting.findUnique({ where: { key: 'fonnte_reset_date' } });
    const resetDate = resetSetting ? new Date(resetSetting.value) : new Date(0);
    
    const verifiedCount = await prisma.user.count({
      where: {
        whatsappVerified: { gt: resetDate }
      }
    });
    
    const fonnteQuota = 1000 - verifiedCount;

    // Payload
    const analytics = {
      totalUsers,
      activeSubscribers,
      totalRevenue,
      filteredRevenue,
      period,
      totalVideosPool,
      availableVideos,
      assignedVideos,
      fonnteQuota,
      userDetails
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
