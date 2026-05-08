const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // 1. Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@coop.com',
      passwordHash,
      role: 'ADMIN',
      name: 'Site Admin'
    }
  });

  const artisan1 = await prisma.user.create({
    data: {
      email: 'sarah@ceramics.com',
      passwordHash,
      role: 'ARTISAN',
      name: 'Sarah Jenkins',
      profile: {
        create: {
          shopName: "Sarah's Ceramics",
          bio: "I've been throwing pots for 20 years. My ceramics are inspired by the natural landscapes of our local area.",
          avatarUrl: 'https://source.unsplash.com/random/200x200/?portrait,woman,1'
        }
      }
    }
  });

  const artisan2 = await prisma.user.create({
    data: {
      email: 'david@wovenwonders.com',
      passwordHash,
      role: 'ARTISAN',
      name: 'David Smith',
      profile: {
        create: {
          shopName: "Woven Wonders",
          bio: "Hand-woven textiles using traditional looms. Sustainable and locally sourced wool.",
          avatarUrl: 'https://source.unsplash.com/random/200x200/?portrait,man,1'
        }
      }
    }
  });

  const customers = [];
  for (let i = 1; i <= 3; i++) {
    customers.push(await prisma.user.create({
      data: {
        email: `customer${i}@example.com`,
        passwordHash,
        role: 'CUSTOMER',
        name: `Customer ${i}`
      }
    }));
  }

  // 2. Products (Fixed Price) - 8 products
  const categories = ['painting', 'jewellery', 'pottery', 'textiles'];
  const artisans = [artisan1.id, artisan2.id];
  
  for (let i = 0; i < 8; i++) {
    const category = categories[i % 4];
    await prisma.product.create({
      data: {
        name: `Beautiful ${category.charAt(0).toUpperCase() + category.slice(1)} Item ${i+1}`,
        description: `This is a wonderful handcrafted ${category}. Made with love and care.`,
        category: category,
        price: Math.floor(Math.random() * 200) + 20,
        stock: Math.floor(Math.random() * 10) + 1,
        images: JSON.stringify([
          `https://source.unsplash.com/random/600x400/?${category},1`,
          `https://source.unsplash.com/random/600x400/?${category},2`,
          `https://source.unsplash.com/random/600x400/?${category},3`
        ]),
        artisanId: artisans[i % 2]
      }
    });
  }

  // 3. Auctions
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const twoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Active Auction
  const activeAuction = await prisma.auction.create({
    data: {
      title: 'Masterpiece Oil Painting',
      description: 'A stunning one-of-a-kind oil painting.',
      category: 'painting',
      startingPrice: 100,
      currentBid: 150,
      status: 'ACTIVE',
      startTime: yesterday,
      endTime: tomorrow,
      artisanId: artisan1.id,
      images: JSON.stringify(['https://source.unsplash.com/random/600x400/?painting,masterpiece'])
    }
  });

  await prisma.bid.createMany({
    data: [
      { amount: 110, auctionId: activeAuction.id, userId: customers[0].id },
      { amount: 130, auctionId: activeAuction.id, userId: customers[1].id },
      { amount: 150, auctionId: activeAuction.id, userId: customers[2].id }
    ]
  });

  // Upcoming Auction
  await prisma.auction.create({
    data: {
      title: 'Exquisite Silver Necklace',
      description: 'Hand-forged silver with a rare gemstone.',
      category: 'jewellery',
      startingPrice: 250,
      currentBid: 250,
      status: 'UPCOMING',
      startTime: tomorrow,
      endTime: twoDays,
      artisanId: artisan2.id,
      images: JSON.stringify(['https://source.unsplash.com/random/600x400/?jewellery,silver'])
    }
  });

  // Closed Auction
  const closedAuction = await prisma.auction.create({
    data: {
      title: 'Vintage Loom Woven Tapestry',
      description: 'Beautiful large-scale wall hanging.',
      category: 'textiles',
      startingPrice: 50,
      currentBid: 120,
      status: 'CLOSED',
      startTime: twoDaysAgo,
      endTime: yesterday,
      artisanId: artisan2.id,
      winnerId: customers[0].id,
      images: JSON.stringify(['https://source.unsplash.com/random/600x400/?textiles,tapestry'])
    }
  });

  await prisma.bid.create({
    data: { amount: 120, auctionId: closedAuction.id, userId: customers[0].id }
  });

  // 4. Orders & Reviews
  const products = await prisma.product.findMany();
  
  const statuses = ['PENDING', 'SHIPPED', 'DELIVERED'];
  for (let i = 0; i < 3; i++) {
    const orderId = `COOP-2024-${Math.floor(10000 + Math.random() * 90000)}`;
    const product = products[i];
    await prisma.order.create({
      data: {
        id: orderId,
        total: product.price,
        status: statuses[i],
        userId: customers[i].id,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            priceAtBuy: product.price
          }
        }
      }
    });
  }

  for (let i = 0; i < 4; i++) {
    await prisma.review.create({
      data: {
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: 'Absolutely love this piece! Great craftsmanship.',
        userId: customers[i % 3].id,
        productId: products[i % 8].id
      }
    });
  }

  console.log('Database seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
