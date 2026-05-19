const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// In-memory state for active auctions
// Realistically, this would be in Redis.
const auctionState = {};

// Helper function to safely send JSON messages to a WebSocket client
function sendToSocket(socket, payload) {
  try {
    if (socket && socket.readyState === 1) { // 1 is WebSocket.OPEN
      socket.send(JSON.stringify(payload));
    }
  } catch (err) {
    console.error("Socket send failed:", err.message);
  }
}

function handleWebSocketConnection(wss) {
  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'SUBSCRIBE') {
          ws.auctionId = data.auctionId;
          // Send current state immediately
          const currentAuction = await prisma.auction.findUnique({
            where: { id: data.auctionId }
          });
          if (currentAuction) {
            sendToSocket(ws, {
              type: 'UPDATE',
              auctionId: currentAuction.id,
              currentBid: currentAuction.currentBid,
              status: currentAuction.status
            });
          }
        }

        if (data.type === 'PLACE_BID') {
          const { auctionId, userId, amount } = data;
          
          // Validation
          const auction = await prisma.auction.findUnique({ where: { id: auctionId } });
          if (!auction || auction.status !== 'ACTIVE') {
            sendToSocket(ws, { type: 'ERROR', message: 'Auction not active' });
            return;
          }
          if (auction.artisanId === userId) {
            sendToSocket(ws, { type: 'ERROR', message: 'Shill bidding is not allowed' });
            return;
          }
          if (amount <= auction.currentBid) {
            sendToSocket(ws, { type: 'ERROR', message: 'Bid must be higher than current bid' });
            return;
          }

          // Update DB within a transaction to ensure integrity
          await prisma.$transaction(async (tx) => {
            const currentAuction = await tx.auction.findUnique({ where: { id: auctionId } });
            if (amount <= currentAuction.currentBid) throw new Error("Bid too low");

            await tx.auction.update({
              where: { id: auctionId },
              data: { currentBid: amount }
            });
            await tx.bid.create({
              data: { amount, auctionId, userId }
            });
          });

          // Broadcast to all clients
          wss.clients.forEach(client => {
            sendToSocket(client, {
              type: 'UPDATE',
              auctionId,
              currentBid: amount
            });
          });
        }
      } catch (err) {
        console.error("WebSocket Error:", err.message);
        sendToSocket(ws, { type: 'ERROR', message: err.message });
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  // 5 seconds broadcast loop to refresh current highest bid
  // Wrapped in try/catch with active state checking to prevent crashes
  setInterval(async () => {
    try {
      const activeClients = Array.from(wss.clients).filter(c => c.readyState === 1);
      if (activeClients.length === 0) return;

      const activeAuctions = await prisma.auction.findMany({
        where: { status: 'ACTIVE' }
      });

      activeClients.forEach(client => {
        if (client.readyState === 1) {
          activeAuctions.forEach(auction => {
            sendToSocket(client, {
              type: 'UPDATE',
              auctionId: auction.id,
              currentBid: auction.currentBid,
              status: auction.status
            });
          });
        }
      });
    } catch (err) {
      console.error("Error in periodic sync loop:", err.message);
    }
  }, 5000); // 5 seconds for periodic sync
}

module.exports = { handleWebSocketConnection };
