const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const AuctionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startingBid: { type: Number, default: 1 },
  currentBid: { type: Number, default: 1 },
  highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  endTime: { type: Date, required: true },
  isFinished: { type: Boolean, default: false },
  bids: [BidSchema]
}, { timestamps: true });

module.exports = mongoose.model('Auction', AuctionSchema);