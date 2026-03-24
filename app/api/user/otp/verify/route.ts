import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { whatsapp, otp } = await req.json();
  if (!otp || !whatsapp) return NextResponse.json({ error: "Missing OTP or WhatsApp number" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }});
  
  if (user?.waOtpCode === otp) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { waOtpCode: null, whatsappVerified: new Date(), whatsapp }
    });
    return NextResponse.json({ success: true, message: "Verification successful!" });
  }

  return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
}
