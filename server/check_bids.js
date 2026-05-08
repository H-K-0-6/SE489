const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBids() {
  const bids = await prisma.bid.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { user: true, auction: true } });
  console.log(JSON.stringify(bids, null, 2));
}

checkBids().catch(console.error).finally(() => prisma.$disconnect());
