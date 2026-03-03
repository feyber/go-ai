import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { whatsapp, tiktok } = await req.json();

    // Clean strings just in case
    const safeWhatsapp = whatsapp ? String(whatsapp).trim() : null;
    const safeTiktok = tiktok ? String(tiktok).trim() : null;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        whatsapp: safeWhatsapp,
        tiktok: safeTiktok
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Failed to update profile", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
