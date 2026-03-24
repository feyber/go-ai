import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Generating 1000 Dummy Videos...");
  const dummyData = Array.from({ length: 1000 }).map((_, i) => ({
    url: `https://dummy-video-link.com/video_${Date.now()}_${i}.mp4`,
    previewUrl: `https://dummy-preview-link.com/preview_${Date.now()}_${i}.mp4`,
    productUrl: `https://shopee.co.id/dummy-product-${i}`,
    isAssigned: false
  }));

  const result = await prisma.video.createMany({
    data: dummyData
  });

  console.log(`Successfully injected ${result.count} dummy videos into the local database.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
