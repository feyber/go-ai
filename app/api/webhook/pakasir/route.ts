export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PAKASIR_SLUG } from '@/lib/pakasir';

import { getWIBDateString } from '@/lib/videoAssignment';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (data.project !== PAKASIR_SLUG) {
      return NextResponse.json({ error: 'Invalid project' }, { status: 400 });
    }

    if (data.status === 'completed') {
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

        // Instant PAY-AS-YOU-GO fulfillment logic
        if (data.order_id.startsWith('PAYG_')) {
          const quota = subscription.tier; // 10 or 30

          // Check if user is Ultimate to respect their category preference
          const dbUser = await prisma.user.findUnique({
            where: { id: subscription.userId },
            select: { videoCategory: true }
          });
          
          const activeSub = await prisma.subscription.findFirst({
            where: { 
              userId: subscription.userId, 
              status: 'completed', 
              tier: 3, 
              expiresAt: { gt: new Date() } 
            },
            orderBy: { startedAt: 'desc' }
          });

          let categoryFilter: any = { isAssigned: false };
          if (activeSub && dbUser?.videoCategory) {
            categoryFilter.category = dbUser.videoCategory;
          }

          // Determine unassigned video pool specifically matching category if applicable
          let availableVideos = await prisma.video.findMany({
            where: categoryFilter,
            take: quota,
            orderBy: { createdAt: 'asc' }
          });

          // Fallback if not enough videos in that category
          if (availableVideos.length < quota && activeSub && dbUser?.videoCategory) {
            const remainder = quota - availableVideos.length;
            const fallbackVideos = await prisma.video.findMany({
              where: { 
                isAssigned: false, 
                id: { notIn: availableVideos.map((v: any) => v.id) } 
              },
              take: remainder,
              orderBy: { createdAt: 'asc' }
            });
            availableVideos = [...availableVideos, ...fallbackVideos];
          }

          if (availableVideos.length > 0) {
            const todayWIB = getWIBDateString();
            
            await prisma.$transaction(
              availableVideos.map((vid: any) => prisma.video.update({
                where: { id: vid.id },
                data: { isAssigned: true }
              }))
            );

            await prisma.userVideo.createMany({
              data: availableVideos.map((vid: any) => ({
                userId: subscription.userId,
                videoId: vid.id,
                assignedDate: todayWIB
              }))
            });

            console.log(`Fulfilled PAYG order ${data.order_id} with ${availableVideos.length} videos`);
          } else {
             // Admin needs to know there aren't enough videos!
             console.warn(`WARNING: PAYG order ${data.order_id} fulfilled but pool was empty!`);
          }
        }

        console.log(`Successfully activated subscription/PAYG for order ${data.order_id}`);
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
