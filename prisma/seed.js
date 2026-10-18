import 'dotenv/config';
import bcrypt from 'bcryptjs';
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

  const membership = await prisma.memberShip.upsert({
    where: { mname: 'Standard' },
    update: {},
    create: { mname: 'Standard', score: 0 },
  });

  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (ADMIN_USERNAME && ADMIN_PASSWORD) {
    const adminRole = await prisma.role.findUnique({ where: { rolename: 'ADMIN' } });
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.upsert({
      where: { username: ADMIN_USERNAME },
      update: {},
      create: {
        username: ADMIN_USERNAME,
        fullname: 'Administrator',
        password: hash,
        roleid: adminRole.roleid,
        mid: membership.mid,
      },
    });
    console.log(`Đã tạo/giữ nguyên tài khoản ADMIN: ${ADMIN_USERNAME}`);
  } else {
    console.warn('Bỏ qua tạo ADMIN vì thiếu ADMIN_USERNAME hoặc ADMIN_PASSWORD trong .env');
  }

  console.log('Seed xong: ADMIN, CUSTOMER, Standard');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
