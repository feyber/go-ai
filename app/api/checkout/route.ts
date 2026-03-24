export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculatePrice, generateOrderId, getCheckoutUrl, PAKASIR_SLUG } from "@/lib/pakasir";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await req.formData();
  const tier = parseInt(formData.get("tier") as string || "1");
  const isYearly = formData.get("isYearly") === "true";
  const isPayg = tier >= 10;

  const amount = calculatePrice(tier, isYearly);
  const orderId = generateOrderId(session.user.id, isPayg);

  // Calculate expiration dates
  // For PAYG, give them an expired date or 1 day just to hold the record (logic handled in webhook)
  const expiresAt = new Date();
  if (isPayg) {
    expiresAt.setDate(expiresAt.getDate() - 1); // instantly expired so it doesn't count as active daily sub
  } else if (isYearly) {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    // 30 days total include today (+29 days), ends at 23:59:59
    expiresAt.setDate(expiresAt.getDate() + 29);
    expiresAt.setHours(23, 59, 59, 999);
  }

  // Create pending subscription in DB
  await prisma.subscription.create({
    data: {
      userId: session.user.id,
      tier,
      status: "pending",
      orderId,
      amount,
      expiresAt
    }
  });

  const url = getCheckoutUrl(PAKASIR_SLUG, amount, orderId);
  return redirect(url);
}
