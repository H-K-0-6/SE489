const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user cart
router.get('/:userId', async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.params.userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
    
    if (!cart) {
      // Create empty cart if it somehow doesn't exist
      const newCart = await prisma.cart.create({
        data: { userId: req.params.userId },
        include: { items: { include: { product: true } } }
      });
      return res.json(newCart);
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to cart
router.post('/:userId/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Check product stock first
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.stock < (quantity || 1)) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.params.userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.params.userId } });
    }

    const transaction = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { stock: product.stock - (quantity || 1) }
      }),
      prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        update: { quantity: { increment: quantity || 1 } },
        create: { cartId: cart.id, productId, quantity: quantity || 1 }
      })
    ]);

    res.status(200).json({ message: 'Added to cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
router.delete('/:userId/remove/:productId', async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.params.userId } });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const cartItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: req.params.productId } }
    });

    if (!cartItem) return res.status(404).json({ error: 'Item not in cart' });

    await prisma.$transaction([
      prisma.cartItem.delete({
        where: { cartId_productId: { cartId: cart.id, productId: req.params.productId } }
      }),
      prisma.product.update({
        where: { id: req.params.productId },
        data: { stock: { increment: cartItem.quantity } }
      })
    ]);

    res.status(200).json({ message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
