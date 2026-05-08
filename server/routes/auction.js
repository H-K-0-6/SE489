const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    let auctions = await prisma.auction.findMany({
      where: { status: { not: 'CLOSED' } },
      include: { artisan: { select: { name: true, profile: true } } },
      orderBy: { endTime: 'asc' }
    });

    if (search) {
      const lowerSearch = search.toLowerCase();
      auctions = auctions.filter(a => 
        a.title.toLowerCase().includes(lowerSearch) || 
        a.description.toLowerCase().includes(lowerSearch) ||
        a.category.toLowerCase().includes(lowerSearch)
      );
    }

    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: req.params.id },
      include: { artisan: { select: { name: true, email: true, profile: true } }, bids: { include: { user: { select: { name: true } } }, orderBy: { amount: 'desc' } } }
    });
    if (!auction) return res.status(404).json({ error: 'Not found' });
    res.json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, category, startingPrice, durationHours, artisanId, images } = req.body;
    
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    const auction = await prisma.auction.create({
      data: {
        title,
        description,
        category,
        startingPrice: parseFloat(startingPrice),
        currentBid: parseFloat(startingPrice),
        status: 'ACTIVE',
        startTime,
        endTime,
        artisanId,
        images: JSON.stringify(images || [])
      }
    });

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
