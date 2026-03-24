export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

export async function GET() {
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

    // Fetch users along with their most recent subscription
    const users = await prisma.user.findMany({
      include: {
        subscriptions: {
          orderBy: { startedAt: 'desc' },
          take: 1
        }
      }
    });

    const memberships = users.map(user => {
      const activeSub = user.subscriptions[0];
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        tiktok: user.tiktok,
        plan: activeSub ? (activeSub.tier >= 10 ? `PAYG ${activeSub.tier}` : (activeSub.tier === 1 ? "Basic" : "Pro Basic")) : "None",
        status: activeSub ? activeSub.status : "N/A",
        expiresAt: activeSub?.expiresAt ? activeSub.expiresAt : null,
      };
    });

    return NextResponse.json(memberships);
  } catch (error) {
    console.error('Error fetching memberships:', error);
    return NextResponse.json({ error: 'Failed to fetch memberships' }, { status: 500 });
  }
}
