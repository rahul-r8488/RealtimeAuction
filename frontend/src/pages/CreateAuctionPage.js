import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateAuctionPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingBid: '',
    endTime: '',
    imageUrl: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { title, description, startingBid, endTime, imageUrl } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Validation
    if (!title.trim() || !description.trim() || !startingBid || !endTime || !imageUrl.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (new Date(endTime) <= new Date()) {
      setError('End date must be in the future.');
      return;
    }

    if (parseInt(startingBid) < 1) {
      setError('Starting bid must be at least ₹1.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const auctionData = {
        ...formData,
        startingBid: parseInt(startingBid)
      };
      
      const res = await api.post('/auctions', auctionData);
      navigate(`/auctions/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create auction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDateTime.toISOString().slice(0, 16);
  };

  return (
    <div className="container">
      <div className="create-auction-form">
        <h2>List a New Item</h2>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Item Title *</label>
            <input 
              type="text" 
              name="title" 
              value={title} 
              onChange={onChange} 
              className="form-input" 
              placeholder="Enter item title"
              maxLength="100"
              required 
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea 
              name="description" 
              value={description} 
              onChange={onChange} 
              className="form-input" 
              placeholder="Describe your item in detail"
              rows="4"
              maxLength="500"
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Starting Bid (₹) *</label>
              <input 
                type="number" 
                name="startingBid" 
                value={startingBid} 
                onChange={onChange} 
                className="form-input" 
                min="1" 
                placeholder="1"
                required 
              />
            </div>
            <div className="form-group">
              <label>End Date & Time *</label>
              <input 
                type="datetime-local" 
                name="endTime" 
                value={endTime} 
                onChange={onChange} 
                className="form-input" 
                min={getMinDateTime()}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL *</label>
            <input 
              type="url" 
              name="imageUrl" 
              value={imageUrl} 
              onChange={onChange} 
              className="form-input" 
              placeholder="https://example.com/image.jpg"
              required 
            />
            {imageUrl && (
              <div className="image-preview">
                <img src={imageUrl} alt="Preview" onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }} />
                <div className="image-preview-placeholder" style={{display: 'none'}}>
                  Image not found
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{width: '100%', marginTop: '1rem'}}
          >
            {loading ? 'Creating Auction...' : 'List Item'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAuctionPage;