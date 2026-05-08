const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting massive database seeding...');

  // Clean DB first to avoid unique constraint issues
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.product.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);
  const categories = ['painting', 'jewellery', 'pottery', 'textiles'];

  const artImages = [
    '/art/art1.png',
    '/art/art2.png',
    '/art/art3.png',
    '/art/art4.png'
  ];

  // 1. Admins
  console.log('Creating admins...');
  const admins = [];
  for (let i = 1; i <= 3; i++) {
    admins.push(await prisma.user.create({
      data: {
        email: `admin${i}@coop.com`,
        passwordHash,
        role: 'ADMIN',
        name: `Admin ${i}`
      }
    }));
  }

  // 2. Artisans (50)
  console.log('Creating 50 artisans...');
  const artisans = [];
  for (let i = 1; i <= 50; i++) {
    artisans.push(await prisma.user.create({
      data: {
        email: `artisan${i}@coop.com`,
        passwordHash,
        role: 'ARTISAN',
        name: `Artisan Name ${i}`,
        profile: {
          create: {
            shopName: `Artisan Shop ${i}`,
            bio: `This is the beautiful bio for artisan ${i}. They love crafting things.`,
            avatarUrl: `https://picsum.photos/seed/artisan${i}/200/200`
          }
        }
      }
    }));
  }

  // 3. Customers (50)
  console.log('Creating 50 customers...');
  const customers = [];
  for (let i = 1; i <= 50; i++) {
    customers.push(await prisma.user.create({
      data: {
        email: `customer${i}@coop.com`,
        passwordHash,
        role: 'CUSTOMER',
        name: `Customer Name ${i}`,
        cart: { create: {} } // Initialize empty cart for every customer
      }
    }));
  }

  // 4. Products (100)
  console.log('Creating 100 products...');
  const products = [];
  for (let i = 1; i <= 100; i++) {
    const artisan = artisans[i % 50];
    const category = categories[i % 4];
    products.push(await prisma.product.create({
      data: {
        name: `Masterpiece ${category} ${i}`,
        description: `An exquisite piece of ${category} made by ${artisan.name}.`,
        category: category,
        price: Math.floor(Math.random() * 500) + 10,
        stock: Math.floor(Math.random() * 20) + 1,
        views: Math.floor(Math.random() * 500),
        images: JSON.stringify([
          artImages[i % artImages.length],
          artImages[(i + 1) % artImages.length]
        ]),
        artisanId: artisan.id
      }
    }));
  }

  // 5. Auctions (50 Active/Upcoming)
  console.log('Creating 50 auctions...');
  const auctions = [];
  const now = new Date();
  for (let i = 1; i <= 50; i++) {
    const artisan = artisans[i % 50];
    const category = categories[i % 4];
    const isActive = i % 2 === 0;
    
    const startTime = isActive ? new Date(now.getTime() - 24 * 60 * 60 * 1000) : new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const endTime = isActive ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : new Date(now.getTime() + 72 * 60 * 60 * 1000);
    const startPrice = Math.floor(Math.random() * 200) + 50;

    auctions.push(await prisma.auction.create({
      data: {
        title: `Exclusive Auction ${category} ${i}`,
        description: `Rare limited edition ${category}.`,
        category: category,
        startingPrice: startPrice,
        currentBid: startPrice,
        status: isActive ? 'ACTIVE' : 'UPCOMING',
        startTime,
        endTime,
        artisanId: artisan.id,
        images: JSON.stringify([artImages[(i + 3) % artImages.length]])
      }
    }));
  }

  // 6. Bids (150)
  console.log('Creating 150 bids...');
  for (let i = 1; i <= 150; i++) {
    // Only bid on ACTIVE auctions
    const activeAuctions = auctions.filter(a => a.status === 'ACTIVE');
    const auction = activeAuctions[i % activeAuctions.length];
    const customer = customers[i % 50];
    
    const newBidAmount = auction.currentBid + 10;
    
    await prisma.bid.create({
      data: {
        amount: newBidAmount,
        auctionId: auction.id,
        userId: customer.id
      }
    });
    
    // Update auction current bid
    await prisma.auction.update({
      where: { id: auction.id },
      data: { currentBid: newBidAmount }
    });
    auction.currentBid = newBidAmount; // sync local memory
  }

  // 7. Orders (50)
  console.log('Creating 50 orders...');
  const statuses = ['PENDING', 'SHIPPED', 'DELIVERED'];
  for (let i = 1; i <= 50; i++) {
    const customer = customers[i % 50];
    const product = products[i % 100];
    const orderId = `COOP-2024-${Math.floor(10000 + Math.random() * 90000)}`;
    
    await prisma.order.create({
      data: {
        id: orderId,
        total: product.price,
        status: statuses[i % 3],
        userId: customer.id,
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

  // 8. Reviews (60)
  console.log('Creating 60 reviews...');
  for (let i = 1; i <= 60; i++) {
    const customer = customers[i % 50];
    const product = products[i % 100];
    
    await prisma.review.create({
      data: {
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: `Excellent product! Truly remarkable craftsmanship. Review ${i}`,
        userId: customer.id,
        productId: product.id
      }
    });
  }

  console.log('Massive seeding completed successfully!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
