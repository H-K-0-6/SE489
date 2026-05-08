const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add to wishlist
router.post('/', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    // Check if user has 50 items already
    const count = await prisma.wishlist.count({ where: { userId } });
    if (count >= 50) return res.status(400).json({ error: 'Wishlist limit reached (50 items)' });

    const item = await prisma.wishlist.create({
      data: { userId, productId }
    });
    res.status(201).json(item);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Item already in wishlist' });
    res.status(500).json({ error: error.message });
  }
});

// Get user wishlist
router.get('/:userId', async (req, res) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.params.userId },
      include: { product: true }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from wishlist
router.delete('/:userId/:productId', async (req, res) => {
  try {
    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: req.params.userId,
          productId: req.params.productId
        }
      }
    });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
