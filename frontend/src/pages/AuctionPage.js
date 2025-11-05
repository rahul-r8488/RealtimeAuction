import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const AuctionPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    fetchAuction();
    setupSocket();
    const timer = setInterval(updateTimeLeft, 1000);

    return () => {
      socket.emit('leaveAuction', id);
      socket.off('bidUpdate');
      socket.off('error');
      clearInterval(timer);
    };
  }, [id]);

  const fetchAuction = async () => {
    try {
      const res = await api.get(`/auctions/${id}`);
      setAuction(res.data);
    } catch (err) {
      setError('Auction not found.');
    }
  };

  const setupSocket = () => {
    socket.emit('joinAuction', id);
    socket.on('bidUpdate', (updatedAuction) => {
      if (updatedAuction._id === id) {
        setAuction(updatedAuction);
      }
    });
    socket.on('error', (err) => {
      setError(err);
      setTimeout(() => setError(''), 3000);
    });
  };

  const updateTimeLeft = () => {
    if (!auction) return;
    
    const difference = +new Date(auction.endTime) - +new Date();
    if (difference > 0) {
      const hours = String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      const minutes = String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, '0');
      const seconds = String(Math.floor((difference / 1000) % 60)).padStart(2, '0');
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    } else {
      setTimeLeft('Auction Ended');
    }
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    if (!user) return setError('You must be logged in to place a bid.');
    if (!bidAmount || parseInt(bidAmount, 10) <= auction.currentBid) {
      return setError('Your bid must be higher than the current bid.');
    }
    
    socket.emit('placeBid', { 
      auctionId: id, 
      bidAmount: parseInt(bidAmount, 10), 
      userId: user._id 
    });
    setBidAmount('');
    setError('');
  };

  if (!auction) return <div className="container">Loading...</div>;

  const isAuctionOver = new Date(auction.endTime) < new Date();

  return (
    <div className="container">
      <div className="auction-page-layout">
        <div className="auction-image-container">
          <img src={auction.imageUrl} alt={auction.title} />
        </div>
        <div className="auction-details">
          <h1>{auction.title}</h1>
          <p>Sold by: {auction.seller?.username || 'Unknown'}</p>
          <p>{auction.description}</p>
          
          <div className="auction-info-box">
            <div className="auction-info-box-content">
              <div>
                <p>Current Bid</p>
                <p className="price">₹{auction.currentBid}</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <p>Time Left</p>
                <p className="time-left">{timeLeft}</p>
              </div>
            </div>
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          {!isAuctionOver ? (
            <form onSubmit={handleBidSubmit} className="bid-form">
              <input 
                type="number" 
                value={bidAmount} 
                onChange={(e) => setBidAmount(e.target.value)} 
                placeholder={`> ₹${auction.currentBid}`} 
                className="form-input" 
                required 
                disabled={!user} 
              />
              <button type="submit" className="btn btn-primary" disabled={!user}>
                Place Bid
              </button>
            </form>
          ) : (
            <div>
              <h3>Auction Ended</h3>
              <p>Winner: {auction.highestBidder?.username || 'None'} with a bid of ₹{auction.currentBid}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionPage;