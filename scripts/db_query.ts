import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:");
  console.log(users.filter(u => JSON.stringify(u).toLowerCase().includes('aigaktidur')));

  const videos = await prisma.video.findMany({
    where: { category: { contains: 'aigaktidur' } }
  });
  console.log("\nVideos with category 'aigaktidur':", videos.length);
  console.log(videos);
  
  const assignments = await prisma.userVideo.findMany({
    include: {
      user: true,
      video: true
    }
  });
  console.log("\nAssignments related to 'aigaktidur':");
  console.log(assignments.filter(a => JSON.stringify(a).toLowerCase().includes('aigaktidur')));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
