import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { whatsapp } = await req.json();
  if (!whatsapp) return NextResponse.json({ error: "No WhatsApp number provided" }, { status: 400 });

  const targetNumber = whatsapp.startsWith("62") ? whatsapp : `62${whatsapp.replace(/^0+/, '')}`;
  
  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Save to db
  await prisma.user.update({
    where: { id: session.user.id },
    data: { waOtpCode: otpCode }
  });

  // Send via Fonnte
  try {
    const fonnteToken = process.env.FONNTE_TOKEN;
    if (fonnteToken) {
      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          "Authorization": fonnteToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          target: targetNumber,
          message: `Your GO-AI Verification Code is: ${otpCode}\n\nDo NOT share this code with anyone.`
        })
      });
      const data = await response.json();
      if (!data.status) {
        console.error("Fonnte API error:", data);
        return NextResponse.json({ error: "Gateway error: " + data.reason }, { status: 500 });
      }
    } else {
      console.warn("FONNTE_TOKEN is not set. OTP code generated but not sent: ", otpCode);
      // For development purposes, if token is not set, we can simulate success
    }
    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("Failed to send OTP", error);
    return NextResponse.json({ error: "Failed to send OTP message" }, { status: 500 });
  }
}
