const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Admin Dashboard Metrics
router.get('/admin', async (req, res) => {
  try {
    const totalRevenue = await prisma.order.aggregate({ _sum: { total: true } });
    const totalUsers = await prisma.user.count({
      where: { role: { in: ['CUSTOMER', 'ARTISAN'] } }
    });
    const activeAuctions = await prisma.auction.count({ where: { status: 'ACTIVE' } });
    
    const users = await prisma.user.findMany({
      where: { role: { in: ['CUSTOMER', 'ARTISAN'] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lockoutUntil: true
      }
    });

    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.lockoutUntil && new Date(u.lockoutUntil) > new Date() ? 'SUSPENDED' : 'ACTIVE'
    }));
    
    res.json({
      totalRevenue: totalRevenue._sum.total || 0,
      totalUsers,
      activeAuctions,
      users: formattedUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Artisan Dashboard Metrics
router.get('/artisan/:artisanId', async (req, res) => {
  try {
    const artisanId = req.params.artisanId;
    
    // Most viewed products
    const topProducts = await prisma.product.findMany({
      where: { artisanId },
      orderBy: { views: 'desc' },
      take: 5
    });

    // Sales history (fixed price)
    const sales = await prisma.orderItem.findMany({
      where: { product: { artisanId } },
      include: { product: true, order: true }
    });

    // Calculate revenue by month for chart
    const monthlyRevenue = sales.reduce((acc, sale) => {
      const month = new Date(sale.order.createdAt).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + sale.priceAtBuy * sale.quantity;
      return acc;
    }, {});

    const chartData = Object.keys(monthlyRevenue).map(key => ({ name: key, revenue: monthlyRevenue[key] }));

    // Fetch all products
    const products = await prisma.product.findMany({
      where: { artisanId }
    });

    // Fetch all active auctions
    const auctions = await prisma.auction.findMany({
      where: { artisanId, status: 'ACTIVE' }
    });

    res.json({
      topProducts,
      sales,
      chartData: chartData.length ? chartData : [{ name: 'Current Month', revenue: 0 }],
      products,
      auctions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer Dashboard Metrics (Bids)
router.get('/customer/:userId/bids', async (req, res) => {
  try {
    const userId = req.params.userId;
    const bids = await prisma.bid.findMany({
      where: { userId },
      include: { auction: true },
      orderBy: { timestamp: 'desc' }
    });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/toggle-suspend/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isSuspended = user.lockoutUntil && new Date(user.lockoutUntil) > new Date();
    const newLockout = isSuspended ? null : new Date('2099-12-31T23:59:59Z');

    await prisma.user.update({
      where: { id: req.params.userId },
      data: { lockoutUntil: newLockout }
    });

    res.json({ message: isSuspended ? 'User activated' : 'User suspended' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
