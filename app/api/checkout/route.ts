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

  const amount = calculatePrice(tier, isYearly);
  const orderId = generateOrderId(session.user.id);

  // Calculate expiration dates (1 month or 1 year from now)
  const expiresAt = new Date();
  if (isYearly) {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
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
