import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const videosNoUrl = await prisma.video.findMany({
    where: { 
      OR: [
        { productUrl: null },
        { productUrl: "" }
      ]
    }
  });

  console.log(`Found ${videosNoUrl.length} videos missing a product URL.`);

  let updatedCount = 0;
  for (let i = 0; i < videosNoUrl.length; i++) {
    await prisma.video.update({
      where: { id: videosNoUrl[i].id },
      data: {
        productUrl: `https://shopee.co.id/dummy-product-${videosNoUrl[i].id.substring(0, 8)}`
      }
    });
    updatedCount++;
  }

  console.log(`Successfully assigned dummy Product URLs to ${updatedCount} videos.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
