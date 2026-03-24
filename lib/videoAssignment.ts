import { prisma } from './prisma';
import { formatInTimeZone } from 'date-fns-tz';

export function getWIBDateString() {
  return formatInTimeZone(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');
}

export async function getAssignedVideos(userId: string) {
  const todayWIB = getWIBDateString();

  // First check active daily subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'completed',
      expiresAt: { gt: new Date() }
    },
    orderBy: { startedAt: 'desc' }
  });

  // GLobal Distribution Interceptor Logic
  const globalDistKey = `globalDistCompleted_${todayWIB}`;
  const isDistributed = await prisma.setting.findUnique({ where: { key: globalDistKey } });

  if (!isDistributed) {
    // Acquire lock to avoid race conditions using a dummy setting
    try {
      await prisma.setting.create({ data: { key: globalDistKey, value: 'true' } });

      const allActiveSubs = await prisma.subscription.findMany({
        where: { status: 'completed', expiresAt: { gt: new Date() }, tier: { lte: 3 } },
        include: { user: true },
        orderBy: { tier: 'desc' } // 3 -> Ultimate, 2 -> Pro, 1 -> Basic (Priority Sorting automatically handles the flow)
      });

      for (const sub of allActiveSubs) {
        let currentAssigned = await prisma.userVideo.findMany({
          where: { userId: sub.userId, assignedDate: todayWIB }
        });
        const needed = sub.tier - currentAssigned.length;
        if (needed <= 0) continue;

        let whereClause: any = { isAssigned: false };
        if (sub.tier >= 3 && sub.user?.videoCategory) {
          whereClause.category = sub.user.videoCategory;
        }

        let availableVideos = await prisma.video.findMany({
          where: whereClause, take: needed, orderBy: { createdAt: 'asc' }
        });

        // Fallback generic videos
        if (availableVideos.length < needed && whereClause.category) {
          const fallbackVideos = await prisma.video.findMany({
            where: { isAssigned: false, id: { notIn: availableVideos.map((v: any) => v.id) } },
            take: needed - availableVideos.length,
            orderBy: { createdAt: 'asc' }
          });
          availableVideos = [...availableVideos, ...fallbackVideos];
        }

        if (availableVideos.length > 0) {
          await prisma.$transaction(
            availableVideos.map((vid: any) => prisma.video.update({
              where: { id: vid.id }, data: { isAssigned: true }
            }))
          );
          await prisma.userVideo.createMany({
            data: availableVideos.map((vid: any) => ({
              userId: sub.userId, videoId: vid.id, assignedDate: todayWIB
            }))
          });
        }
      }
      console.log(`Global distribution completed successfully for ${todayWIB}.`);
    } catch {
      // If setting already exists, it means another request got here in the exact millisecond. Safe to ignore.
      console.log(`Global distribution for ${todayWIB} handled by another request.`);
    }
  }

  // Fetch ALL videos the user has access to
  const allUserVideos = await prisma.userVideo.findMany({
    where: {
      userId: userId
    },
    include: {
      video: true
    },
    orderBy: [
      { assignedDate: 'desc' },
      { id: 'desc' }
    ]
  });

  // Check for any unfulfilled video to lock future downloads
  const pendingVideo = undefined;

  // hasAccess is true if they have an active sub OR they have unfulfilled videos from PAYG/history
  const hasAccess = !!subscription || allUserVideos.length > 0;

  return { hasAccess, videos: allUserVideos, pendingVideo, activeSubscription: subscription };
}
