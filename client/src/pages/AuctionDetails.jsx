import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gavel, Clock, ArrowLeft, Store } from 'lucide-react';

const calculateTimeLeft = (endTime) => {
  const difference = new Date(endTime) - new Date();
  if (difference <= 0) return "Ended";
  
  const hours = Math.floor((difference / (1000 * 60 * 60)));
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  const seconds = Math.floor((difference / 1000) % 60);
  
  return `${hours}h ${minutes}m ${seconds}s`;
};

function AuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [auction, setAuction] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [timeLeft, setTimeLeft] = useState('');
  const [bidInput, setBidInput] = useState(0);
  const wsRef = useRef(null);

  useEffect(() => {
    // Record view in local storage for the catalog eye icon
    localStorage.setItem(`viewed_auction_${id}`, 'true');

    fetch(`http://localhost:3001/api/auctions/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Auction not found');
        return res.json();
      })
      .then(data => {
        setAuction(data);
        const images = JSON.parse(data.images || '[]');
        if (images.length > 0) setMainImage(images[0]);
        setBidInput(data.currentBid + 10);
        setTimeLeft(calculateTimeLeft(data.endTime));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    // WebSocket connection for live bids
    wsRef.current = new WebSocket('ws://localhost:3001');
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'UPDATE' && data.auctionId === id) {
        setAuction(prev => ({ ...prev, currentBid: data.currentBid, status: data.status || prev.status }));
      }
      if (data.type === 'ERROR') alert(data.message);
    };

    return () => { if (wsRef.current) wsRef.current.close(); };
  }, [id]);

  useEffect(() => {
    if (!auction) return;
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(auction.endTime)), 1000);
    return () => clearInterval(timer);
  }, [auction]);

  useEffect(() => {
    if (auction && bidInput <= auction.currentBid) {
      setBidInput(auction.currentBid + 10);
    }
  }, [auction?.currentBid]);

  const submitBid = () => {
    if (!user) {
      alert("Please login to place a bid.");
      return;
    }
    if (bidInput <= auction.currentBid) {
      alert("Bid must be strictly higher than current bid.");
      return;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'PLACE_BID',
        auctionId: id,
        userId: user.userId,
        amount: bidInput
      }));
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '4rem', textAlign: 'center' }}>Loading details...</div>;
  if (error) return <div style={{ color: 'var(--color-featured)', padding: '4rem', textAlign: 'center' }}>{error}</div>;

  const images = JSON.parse(auction.images || '[]');

  return (
    <div className="container" style={{ padding: '4rem 24px' }}>
      <button className="btn btn-outline" style={{ marginBottom: '2rem' }} onClick={() => navigate('/auctions')}>
        <ArrowLeft size={18} /> Back to Auction House
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '4rem' }}>
        {/* Image Gallery */}
        <div>
          <div className="glass-panel" style={{ padding: '10px', marginBottom: '20px', position: 'relative' }}>
            <img 
              src={mainImage || 'https://via.placeholder.com/600'} 
              alt={auction.title} 
              style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '16px' }} 
            />
            {auction.status === 'ACTIVE' && <div className="live-badge" style={{ top: '26px', left: '26px' }}>LIVE AUCTION</div>}
            {auction.status === 'UPCOMING' && <div className="live-badge" style={{ top: '26px', left: '26px', background: 'var(--color-directory)' }}>UPCOMING</div>}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              {images.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img} 
                  alt={`Thumbnail ${idx}`}
                  onClick={() => setMainImage(img)}
                  style={{ 
                    width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer',
                    border: mainImage === img ? '2px solid var(--color-directory)' : '2px solid transparent',
                    opacity: mainImage === img ? 1 : 0.6,
                    transition: 'all 0.2s ease'
                  }} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Auction Info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ textTransform: 'uppercase', color: 'var(--color-directory)', letterSpacing: '2px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>
            {auction.category}
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', lineHeight: '1.2' }}>{auction.title}</h1>
          <p style={{ color: 'var(--color-text)', fontSize: '1.1rem', marginBottom: '30px', lineHeight: '1.8' }}>
            {auction.description}
          </p>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-text)', letterSpacing: '1px' }}>Current Bid</div>
                <div style={{ fontSize: '3rem', fontWeight: '800', fontFamily: 'Playfair Display', color: 'var(--color-directory)', lineHeight: 1 }}>${auction.currentBid}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-text)', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}><Clock size={16} /> Time Left</div>
                <div style={{ fontWeight: '700', fontSize: '1.5rem', color: auction.status === 'ACTIVE' ? 'white' : '#666' }}>
                  {timeLeft}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {auction.status === 'ACTIVE' && (
                <input 
                  type="number" 
                  className="search-bar" 
                  style={{ width: '120px', borderRadius: '8px' }} 
                  value={bidInput} 
                  onChange={(e) => setBidInput(parseFloat(e.target.value))} 
                  min={auction.currentBid + 1}
                />
              )}
              <button 
                className={`btn ${auction.status === 'ACTIVE' ? 'btn-danger' : 'btn-outline'}`}
                style={{ flexGrow: 1, padding: '1rem', fontSize: '1.2rem' }}
                disabled={auction.status !== 'ACTIVE'}
                onClick={submitBid}
              >
                <Gavel size={24} /> {auction.status === 'ACTIVE' ? `Place Bid` : (auction.status === 'UPCOMING' ? 'Upcoming Auction' : 'Auction Closed')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Artisan Section */}
      <div className="glass-panel">
        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Store color="var(--color-directory)" /> Meet the Artisan
        </h3>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          <img 
            src={auction.artisan?.profile?.avatarUrl || 'https://via.placeholder.com/150'} 
            alt="Artisan Avatar" 
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-directory)' }} 
          />
          <div>
            <h2 style={{ marginBottom: '8px' }}>{auction.artisan?.name}</h2>
            {auction.artisan?.profile?.shopName && (
              <div style={{ color: 'var(--color-recruitment)', fontWeight: 'bold', marginBottom: '16px' }}>
                Shop: {auction.artisan.profile.shopName}
              </div>
            )}
            <p style={{ color: 'var(--color-text)', lineHeight: '1.7', marginBottom: '16px' }}>
              {auction.artisan?.profile?.bio || "This artisan hasn't added a biography yet."}
            </p>
            {auction.artisan?.email && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--glass-border)' }}>
                <span style={{ color: 'var(--color-text)' }}>Contact me: </span>
                <a href={`mailto:${auction.artisan.email}`} style={{ color: 'var(--color-directory)', fontWeight: 'bold' }}>{auction.artisan.email}</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuctionDetails;
