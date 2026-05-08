const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const auctionRoutes = require('./routes/auction');
const orderRoutes = require('./routes/order');
const wishlistRoutes = require('./routes/wishlist');
const dashboardRoutes = require('./routes/dashboard');
const cartRoutes = require('./routes/cart');
const uploadRoutes = require('./routes/upload');
const artisanRoutes = require('./routes/artisan');
const { handleWebSocketConnection } = require('./websocket');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/artisans', artisanRoutes);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

handleWebSocketConnection(wss);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
