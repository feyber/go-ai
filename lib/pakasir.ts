import crypto from 'crypto';

export const PAKASIR_SLUG = process.env.PAKASIR_SLUG || "";
export const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY || "";

// Base rates in IDR
export const TIER_PRICES: Record<number, number> = {
  1: 99000,   // Basic (1 video/day)
  2: 199000,  // Pro (2 videos/day) 
  3: 549000,  // Ultimate (3 videos/day)
  10: 50000,  // PAY-AS-YOU-GO (10 videos)
  30: 150000, // PAY-AS-YOU-GO (30 videos)
};

export function calculatePrice(tier: number, isYearly: boolean) {
  let amount = TIER_PRICES[tier] || TIER_PRICES[1];
  // Yearly discount does not apply to PAYG
  if (isYearly && tier < 10) {
    amount = amount * 12 * 0.8; // 20% discount for yearly
  }
  return Math.floor(amount);
}

export function generateOrderId(userId: string, isPayg: boolean = false) {
  // Pakasir requires order id without spaces
  const rnd = crypto.randomBytes(4).toString('hex');
  const prefix = isPayg ? 'PAYG_' : 'SUB_';
  return `${prefix}${userId.slice(0, 8)}_${rnd}`;
}

export function getCheckoutUrl(slug: string, amount: number, orderId: string) {
  return `https://app.pakasir.com/pay/${slug}/${amount}?order_id=${orderId}`;
}
