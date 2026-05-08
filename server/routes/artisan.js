const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get top 3 artisans by revenue
router.get('/top', async (req, res) => {
  try {
    const artisans = await prisma.user.findMany({
      where: { role: 'ARTISAN' },
      include: {
        profile: true,
        products: {
          include: {
            orderItems: true
          }
        }
      }
    });

    const artisansWithRevenue = artisans.map(artisan => {
      let revenue = 0;
      artisan.products.forEach(product => {
        product.orderItems.forEach(item => {
          revenue += item.quantity * item.priceAtBuy;
        });
      });
      return {
        id: artisan.id,
        name: artisan.name,
        email: artisan.email,
        profile: artisan.profile,
        revenue
      };
    });

    artisansWithRevenue.sort((a, b) => b.revenue - a.revenue);
    const topArtisans = artisansWithRevenue.slice(0, 3);
    res.json(topArtisans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all artisans
router.get('/', async (req, res) => {
  try {
    const artisans = await prisma.user.findMany({
      where: { role: 'ARTISAN' },
      select: {
        id: true,
        name: true,
        email: true,
        profile: true
      }
    });
    res.json(artisans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
