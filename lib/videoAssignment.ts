import { prisma } from './prisma';
import { formatInTimeZone } from 'date-fns-tz';

export function getWIBDateString() {
  return formatInTimeZone(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');
}

export async function getAssignedVideos(userId: string) {
  const todayWIB = getWIBDateString();

  // First check if user has an active subscription
  // Active if status is 'completed' and expiresAt is in the future
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'completed',
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      expiresAt: 'desc'
    }
  });

  if (!subscription) {
    return { hasAccess: false, videos: [] };
  }

  // Get current assigned videos for today
  let currentAssigned = await prisma.userVideo.findMany({
    where: {
      userId,
      assignedDate: todayWIB
    },
    include: {
      video: true
    }
  });

  const quota = subscription.tier; // 1, 2, or 3

  // If user hasn't gotten their full quota today
  if (currentAssigned.length < quota) {
    const needed = quota - currentAssigned.length;

    // Find unassigned videos from pool via nested query or finding first then updating
    // We use a transaction to safely pick videos unassigned
    const availableVideos = await prisma.video.findMany({
      where: {
        isAssigned: false
      },
      take: needed,
      orderBy: {
        createdAt: 'asc' // FIFO
      }
    });

    if (availableVideos.length > 0) {
      await prisma.$transaction(
        availableVideos.map(vid => prisma.video.update({
          where: { id: vid.id },
          data: { isAssigned: true }
        }))
      );

      await prisma.userVideo.createMany({
        data: availableVideos.map(vid => ({
          userId,
          videoId: vid.id,
          assignedDate: todayWIB
        }))
      });

      // Fetch again to get updated list
      currentAssigned = await prisma.userVideo.findMany({
        where: {
          userId,
          assignedDate: todayWIB
        },
        include: {
          video: true
        }
      });
    }
  }

  return { hasAccess: true, videos: currentAssigned.map(uv => uv.video) };
}
