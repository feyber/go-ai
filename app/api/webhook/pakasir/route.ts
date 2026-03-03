export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PAKASIR_SLUG } from '@/lib/pakasir';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Webhook payload from Pakasir
    // { "amount": 22000, "order_id": "SUB_123_456", "project": "depodomain", "status": "completed", ... }

    if (data.project !== PAKASIR_SLUG) {
      return NextResponse.json({ error: 'Invalid project' }, { status: 400 });
    }

    if (data.status === 'completed') {
      // Find the pending subscription
      const subscription = await prisma.subscription.findUnique({
        where: { orderId: data.order_id }
      });

      if (subscription && subscription.status !== 'completed' && subscription.amount === data.amount) {
        // Update to completed
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'completed',
            paymentMethod: data.payment_method || 'unknown'
          }
        });
        console.log(`Successfully activated subscription for order ${data.order_id}`);
      } else {
        console.warn(`Could not activate subscription ${data.order_id} - Mismatch or already completed`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
