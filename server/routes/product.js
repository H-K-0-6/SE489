const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = {};
    if (category) where.category = category;

    let products = await prisma.product.findMany({
      where,
      include: { artisan: { select: { name: true, profile: true } } }
    });

    if (search) {
      const lowerSearch = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        p.description.toLowerCase().includes(lowerSearch)
      );
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
      include: { artisan: { select: { name: true, email: true, profile: true } }, reviews: { include: { user: { select: { name: true } } } } }
    });
    res.json(product);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, category, price, stock, images, artisanId } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        images: JSON.stringify(images || []),
        artisanId
      }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
