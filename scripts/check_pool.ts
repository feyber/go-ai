import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const unassigned = await prisma.video.count({ where: { isAssigned: false } });
  console.log(`Total Unassigned Videos in Pool: ${unassigned}`);

  const user = await prisma.user.findUnique({
    where: { email: 'bokunft@gmail.com' } // from screenshot
  });

  if (user) {
    console.log(`Found user ${user.email} (ID: ${user.id})`);
    
    const sub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'completed', expiresAt: { gt: new Date() } }
    });
    console.log(`Active Subscription: `, sub ? `Tier ${sub.tier}` : 'None');

    const userVideos = await prisma.userVideo.findMany({
      where: { userId: user.id },
      include: { video: true }
    });
    console.log(`Total UserVideos for this user: ${userVideos.length}`);
    if (userVideos.length > 0) {
      console.log(`Sample UserVideo:`, userVideos[0]);
    }
  } else {
    console.log(`User bokunft@gmail.com not found.`);
  }

  // user aigaktidur@gmail.com
  const user2 = await prisma.user.findUnique({
    where: { email: 'aigaktidur@gmail.com' }
  });

  if (user2) {
    console.log(`Found user2 ${user2.email} (ID: ${user2.id})`);
    const sub2 = await prisma.subscription.findFirst({
      where: { userId: user2.id, status: 'completed', expiresAt: { gt: new Date() } }
    });
    console.log(`Active Subscription user2: `, sub2 ? `Tier ${sub2.tier}` : 'None');
    
    const uservids2 = await prisma.userVideo.count({ where: { userId: user2.id } });
    console.log(`Total UserVideos for user2: ${uservids2}`);
  }

}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
