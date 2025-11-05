import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import AuctionCard from '../components/auction/AuctionCard';
import StatCard from '../components/ui/StatCard';
import { FaGavel, FaUsers, FaTrophy } from 'react-icons/fa';

const HomePage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const res = await api.get('/auctions');
      console.log('Fetched auctions:', res.data); // Debug log
      setAuctions(res.data);
    } catch (err) {
      console.error("Failed to fetch auctions", err);
    } finally {
      setLoading(false);
    }
  };

  const hasUserParticipated = (auction) => {
    if (!user || !auction.bids) return false;
    
    // Check if user has any bids in this auction
    return auction.bids.some(bid => {
      // Handle both string and object formats
      const bidUserId = typeof bid.user === 'string' ? bid.user : bid.user?._id;
      return bidUserId === user._id;
    });
  };

  const isUserWinning = (auction) => {
    if (!user || auction.isFinished) return false;
    
    // Check if user is the highest bidder
    const highestBidderId = typeof auction.highestBidder === 'string' 
      ? auction.highestBidder 
      : auction.highestBidder?._id;
    
    return highestBidderId === user._id;
  };

  const getStats = () => {
    const liveAuctions = auctions.filter(a => !a.isFinished);
    const participatedAuctions = user ? auctions.filter(hasUserParticipated) : [];
    const winningAuctions = user ? auctions.filter(isUserWinning) : [];
    
    return {
      liveAuctions: liveAuctions.length,
      participated: participatedAuctions.length,
      winning: winningAuctions.length,
    };
  };

  const getFilteredAuctions = () => {
    switch (filter) {
      case 'live':
        return auctions.filter(a => !a.isFinished);
      case 'participated':
        return user ? auctions.filter(hasUserParticipated) : [];
      case 'winning':
        return user ? auctions.filter(isUserWinning) : [];
      default:
        return auctions;
    }
  };

  if (loading) return <div className="container">Loading auctions...</div>;

  const stats = getStats();
  const filteredAuctions = getFilteredAuctions();

  return (
    <div className="container">
      <div className="stats-grid">
        <StatCard 
          title="Live Auctions" 
          value={stats.liveAuctions} 
          icon={<FaGavel />} 
          iconColor="#60a5fa" 
        />
        <StatCard 
          title="You Participated" 
          value={stats.participated} 
          icon={<FaUsers />} 
          iconColor="#4ade80" 
        />
        <StatCard 
          title="You're Winning" 
          value={stats.winning} 
          icon={<FaTrophy />} 
          iconColor="#facc15" 
        />
      </div>

      <div className="filter-tabs">
        <button 
          onClick={() => setFilter('all')} 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
        >
          All ({auctions.length})
        </button>
        <button 
          onClick={() => setFilter('live')} 
          className={`filter-btn ${filter === 'live' ? 'active' : ''}`}
        >
          Live Auctions ({stats.liveAuctions})
        </button>
        {user && (
          <>
            <button 
              onClick={() => setFilter('participated')} 
              className={`filter-btn ${filter === 'participated' ? 'active' : ''}`}
            >
              You Participated ({stats.participated})
            </button>
            <button 
              onClick={() => setFilter('winning')} 
              className={`filter-btn ${filter === 'winning' ? 'active' : ''}`}
            >
              You're Winning ({stats.winning})
            </button>
          </>
        )}
      </div>

      <div className="auction-grid">
        {filteredAuctions.length > 0 ? (
          filteredAuctions.map(auction => (
            <AuctionCard key={auction._id} auction={auction} />
          ))
        ) : (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '2rem',
            color: '#9ca3af'
          }}>
            No auctions found for this filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;