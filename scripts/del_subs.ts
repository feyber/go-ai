import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function del() {
  await prisma.subscription.deleteMany({
    where: { 
        userId: 'cmm9d9ftf000111aanms2eun7',
        tier: 1,
        status: 'completed'
    }
  });
  console.log('Deleted old tier 1 test data.');
}
del();
