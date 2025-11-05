import React from 'react';
import { Link } from 'react-router-dom';

const AuctionCard = ({ auction }) => {
  const getTimeLeft = () => {
    const now = new Date();
    const endTime = new Date(auction.endTime);
    const difference = endTime - now;
    
    if (difference <= 0) return 'Ended';
    
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } else {
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes}m`;
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `₹${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(1)}K`;
    }
    return `₹${price}`;
  };

  return (
    <Link to={`/auctions/${auction._id}`} className="auction-card">
      <div className="auction-card-header">
        <div className="live-badge">Live</div>
        <h3 className="auction-title">{auction.title}</h3>
        <p className="auction-description">{auction.description}</p>
      </div>
      
      <div className="auction-card-image-container">
        <img 
          src={auction.imageUrl} 
          alt={auction.title} 
          className="auction-card-image" 
        />
      </div>
      
      <div className="auction-card-content">
        <p className="seller">Sold by: {auction.seller?.username || 'Unknown'}</p>
        
        <div className="auction-card-details">
          <div className="bid-info">
            <p className="bid-label">Current Bid</p>
            <p className="price">{formatPrice(auction.currentBid)}</p>
          </div>
          <div className="time-info">
            <p className="time-label">Time Left</p>
            <p className="time-left">{getTimeLeft()}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;