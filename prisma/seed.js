import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  for (const rolename of ['ADMIN', 'CUSTOMER']) {
    await prisma.role.upsert({
      where: { rolename },
      update: {},
      create: { rolename },
    });
  }

  await prisma.memberShip.upsert({
    where: { mname: 'Standard' },
    update: {},
    create: { mname: 'Standard', score: 0 },
  });

  console.log('Seed xong: ADMIN, CUSTOMER, Standard');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
