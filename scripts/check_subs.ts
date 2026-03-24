import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const subs = await prisma.subscription.findMany({
    where: { user: { email: 'aigaktidur@gmail.com' } }
  });
  console.log(subs);
}
check();
