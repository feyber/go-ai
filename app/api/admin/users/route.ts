export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ensure requester is Super Admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && (session.user as any).role === "ADMIN";
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    include: {
      subscriptions: {
        where: { status: "completed" },
        orderBy: { expiresAt: "desc" },
        take: 1
      },
      _count: {
        select: {
          assignedVideos: { where: { downloadedAt: { not: null } } }
        }
      }
    },
    orderBy: { email: 'asc' }
  });

  const whitelisted = await prisma.whitelistedEmail.findMany();

  return NextResponse.json({ users, whitelisted });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { action, email, userId, duration, tier } = await req.json();

    if (action === "whitelist_add") {
      await prisma.whitelistedEmail.create({ data: { email } });
      return NextResponse.json({ success: true });
    }

    if (action === "whitelist_remove") {
      await prisma.whitelistedEmail.delete({ where: { email } });
      return NextResponse.json({ success: true });
    }

    if (action === "grant_subscription") {
      const expiresAt = new Date();
      if (duration === "3_days") expiresAt.setDate(expiresAt.getDate() + 3);
      else if (duration === "7_days") expiresAt.setDate(expiresAt.getDate() + 7);
      else if (duration === "1_month") expiresAt.setMonth(expiresAt.getMonth() + 1);
      else if (duration === "1_year") expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      await prisma.subscription.create({
        data: {
          userId,
          tier: parseInt(tier),
          status: "completed",
          orderId: `MANUAL_${Date.now()}_${userId.slice(0, 5)}`,
          amount: 0,
          paymentMethod: "manual_grant",
          expiresAt
        }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "change_role") {
      const { role } = await req.json();
      if (!["USER", "OPERATOR", "ADMIN"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: userId },
        data: { role }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin action failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
