export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const transactions = await prisma.subscription.findMany({
      where: { status: "completed" },
      include: {
        user: { select: { email: true } },
      },
      orderBy: { startedAt: "desc" },
    });
    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Failed to fetch transactions", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
