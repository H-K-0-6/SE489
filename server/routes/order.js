const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// This should ideally be protected with middleware
router.post('/checkout', async (req, res) => {
  try {
    const { userId } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let total = 0;
    cart.items.forEach(item => {
      total += item.product.price * item.quantity;
    });

    const orderId = `COOP-2024-${Math.floor(10000 + Math.random() * 90000)}`;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          id: orderId,
          userId,
          total,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtBuy: item.product.price
            }))
          }
        }
      });

      // Empty the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      return newOrder;
    });

    // MOCK PDF Invoicing and Email Sending
    console.log(`[EMAIL MOCK] Sending order confirmation to User ${userId} for Order ${orderId}`);
    console.log(`[PDF MOCK] Generating tax invoice PDF for Order ${orderId} in /server/invoices`);

    res.status(201).json({ message: 'Order created', orderId: order.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.params.userId },
      include: { items: { include: { product: true } } }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'SHIPPED', 'DELIVERED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
