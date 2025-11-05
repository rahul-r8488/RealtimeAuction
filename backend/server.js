require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const connectDB = require('./config/db');
const Auction = require('./models/Auction');

// Connect to Database
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auctions', require('./routes/auctions'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

// Simplified WebSocket Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinAuction', (auctionId) => {
    socket.join(auctionId);
  });

  socket.on('placeBid', async ({ auctionId, bidAmount, userId }) => {
    try {
      const auction = await Auction.findById(auctionId);
      if (!auction || auction.isFinished) {
        return socket.emit('error', 'Auction has ended or does not exist.');
      }
      if (bidAmount <= auction.currentBid) {
        return socket.emit('error', 'Bid must be higher than current bid.');
      }

      // Update auction with new bid
      auction.currentBid = bidAmount;
      auction.highestBidder = userId;
      
      // Add bid to history
      auction.bids.push({
        user: userId,
        amount: bidAmount,
        timestamp: new Date()
      });
      
      await auction.save();

      const updatedAuction = await Auction.findById(auctionId)
        .populate('highestBidder', 'username')
        .populate('bids.user', 'username');
      
      io.to(auctionId).emit('bidUpdate', updatedAuction);

    } catch (error) {
      socket.emit('error', 'Error placing bid.');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Check for ended auctions every 30 seconds
setInterval(async () => {
  const now = new Date();
  const endedAuctions = await Auction.find({ endTime: { $lte: now }, isFinished: false });
  
  for (const auction of endedAuctions) {
    auction.isFinished = true;
    await auction.save();
    io.emit('auctionEnded', { auctionId: auction._id, winner: auction.highestBidder });
  }
}, 30000);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));