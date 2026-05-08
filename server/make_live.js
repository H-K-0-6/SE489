const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.auction.updateMany({
    where: { status: 'UPCOMING' },
    data: { status: 'ACTIVE' }
  });
  console.log(`Updated ${result.count} upcoming auctions to ACTIVE!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
