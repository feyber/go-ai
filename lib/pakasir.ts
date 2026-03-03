import crypto from 'crypto';

export const PAKASIR_SLUG = process.env.PAKASIR_SLUG || "";
export const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY || "";

// Assume base monthly rates (in IDR for example)
export const TIER_PRICES: Record<number, number> = {
  1: 150000, // 150k
  2: 250000,
  3: 350000,
};

export function calculatePrice(tier: number, isYearly: boolean) {
  let amount = TIER_PRICES[tier] || TIER_PRICES[1];
  if (isYearly) {
    amount = amount * 12 * 0.8; // 20% discount for yearly
  }
  return Math.floor(amount);
}

export function generateOrderId(userId: string) {
  // Pakasir requires order id without spaces
  const rnd = crypto.randomBytes(4).toString('hex');
  return `SUB_${userId.slice(0, 8)}_${rnd}`;
}

export function getCheckoutUrl(slug: string, amount: number, orderId: string) {
  return `https://app.pakasir.com/pay/${slug}/${amount}?order_id=${orderId}`;
}
