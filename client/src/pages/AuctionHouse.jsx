import React, { useEffect, useState, useRef } from 'react'
import { Gavel, Clock, Heart, Eye, Search, Tag, History, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const calculateTimeLeft = (endTime) => {
  const difference = new Date(endTime) - new Date();
  if (difference <= 0) return "Ended";

  const hours = Math.floor((difference / (1000 * 60 * 60)));
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return `${hours}h ${minutes}m ${seconds}s`;
}

const AuctionCard = ({ auction, onBid }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(auction.endTime));
  const [bidInput, setBidInput] = useState(auction.currentBid + 10);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(auction.endTime)), 1000);
    return () => clearInterval(timer);
  }, [auction.endTime]);

  // Update default input when bid changes
  useEffect(() => {
    if (bidInput <= auction.currentBid) {
      setBidInput(auction.currentBid + 10);
    }
  }, [auction.currentBid]);

  const submitBid = () => {
    if (bidInput <= auction.currentBid) {
      alert("Bid must be strictly higher than current bid.");
      return;
    }
    onBid(auction.id, bidInput);
  }

  const images = JSON.parse(auction.images || '[]')
  const isViewed = localStorage.getItem(`viewed_auction_${auction.id}`) === 'true';

  return (
    <div className="card" style={{ borderColor: auction.status === 'ACTIVE' ? 'var(--color-featured)' : 'var(--glass-border)' }}>
      <div className="card-img-wrapper">
        <Link to={`/auction/${auction.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          <img src={images[0] || 'https://via.placeholder.com/400'} alt={auction.title} />
        </Link>
        {auction.status === 'ACTIVE' && <div className="live-badge">LIVE AUCTION</div>}
        {auction.status === 'UPCOMING' && <div className="live-badge" style={{ background: 'var(--color-directory)' }}>UPCOMING</div>}
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
          <button style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)' }}><Heart size={18} /></button>
          <Link to={`/auction/${auction.id}`} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: isViewed ? 'var(--color-recruitment)' : 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)', display: 'flex' }}><Eye size={18} /></Link>
        </div>
      </div>
      <div className="card-body">
        <div className="card-category">{auction.category}</div>
        <h3 className="card-title">
          <Link to={`/auction/${auction.id}`} style={{ color: 'inherit' }}>{auction.title}</Link>
        </h3>

        <p style={{ color: 'var(--color-text)', fontSize: '0.9rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {auction.description}
        </p>

        <div className="card-artisan">
          <img src={auction.artisan?.profile?.avatarUrl || 'https://via.placeholder.com/40'} alt="avatar" className="artisan-avatar" style={{ width: '24px', height: '24px', borderWidth: '1px' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>By {auction.artisan?.name || 'Unknown Artisan'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text)', letterSpacing: '1px' }}>Current Bid</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'Playfair Display', color: 'var(--color-directory)', lineHeight: 1 }}>BD {auction.currentBid}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text)', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}><Clock size={14} /> Time Left</div>
            <div style={{ fontWeight: '700', fontSize: '1.2rem', color: auction.status === 'ACTIVE' ? 'white' : '#666' }}>
              {timeLeft}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {auction.status === 'ACTIVE' && (
            <input
              type="number"
              className="search-bar"
              style={{ width: '100px', borderRadius: '8px' }}
              value={bidInput}
              onChange={(e) => setBidInput(parseFloat(e.target.value))}
              min={auction.currentBid + 1}
            />
          )}
          <button
            className={`btn ${auction.status === 'ACTIVE' ? 'btn-danger' : 'btn-outline'}`}
            style={{ flexGrow: 1, padding: '1rem', fontSize: '1.1rem' }}
            disabled={auction.status !== 'ACTIVE'}
            onClick={submitBid}
          >
            <Gavel size={20} /> {auction.status === 'ACTIVE' ? `Place Bid` : (auction.status === 'UPCOMING' ? 'Upcoming Auction' : 'Auction Closed')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AuctionHouse() {
  const [auctions, setAuctions] = useState([])
  const wsRef = useRef(null)
  const { user } = useAuth()

  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState(JSON.parse(localStorage.getItem('auctionSearchHistory') || '[]'))
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const removeFromHistory = (e, term) => {
    e.stopPropagation();
    const updated = searchHistory.filter(h => h !== term);
    setSearchHistory(updated);
    localStorage.setItem('auctionSearchHistory', JSON.stringify(updated));
  }
  useEffect(() => {
    let url = 'http://localhost:3001/api/auctions'
    if (searchQuery) {
      url += `?search=${encodeURIComponent(searchQuery)}`
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAuctions(data);
        } else {
          console.error("Expected array from auctions endpoint, received:", data);
          setAuctions([]);
        }
      })
      .catch(err => console.error(err))
  }, [searchQuery])

  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:3001')

    wsRef.current.onopen = () => console.log('Connected to WebSocket server')

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'UPDATE') {
          setAuctions(prev => {
            if (!Array.isArray(prev)) return [];
            return prev.map(a =>
              a.id === data.auctionId ? { ...a, currentBid: data.currentBid, status: data.status || a.status } : a
            );
          });
        }
        if (data.type === 'ERROR') alert(data.message)
      } catch (err) {
        console.error("Failed to parse websocket message:", err);
      }
    }

    return () => { if (wsRef.current) wsRef.current.close() }
  }, [])

  const handleBid = (auctionId, amount) => {
    if (!user) {
      alert("Please login to place a bid.");
      return;
    }
    const userId = user.userId;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'PLACE_BID',
        auctionId, userId, amount
      }))
    }
  }

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setSearchQuery(searchInput);
    if (searchInput.trim()) {
      const updated = [searchInput.trim(), ...searchHistory.filter(h => h !== searchInput.trim())].slice(0, 5);
      setSearchHistory(updated);
      localStorage.setItem('auctionSearchHistory', JSON.stringify(updated));
    }
    setShowDropdown(false);
  }

  const selectSuggestion = (val) => {
    setSearchInput(val);
    setSearchQuery(val);
    if (val.trim()) {
      const updated = [val.trim(), ...searchHistory.filter(h => h !== val.trim())].slice(0, 5);
      setSearchHistory(updated);
      localStorage.setItem('auctionSearchHistory', JSON.stringify(updated));
    }
    setShowDropdown(false);
  }

  const categories = Array.isArray(auctions) ? [...new Set(auctions.map(a => a.category))] : [];
  const categorySuggestions = searchInput.length > 0 
    ? categories.filter(cat => cat.toLowerCase().includes(searchInput.toLowerCase())).slice(0, 3)
    : [];
  
  const historyToShow = searchInput.length > 0
    ? searchHistory.filter(h => h.toLowerCase().includes(searchInput.toLowerCase())).slice(0, 3)
    : searchHistory.slice(0, 5);

  return (
    <div className="container" style={{ padding: '4rem 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '16px' }}>Auction House</h1>
        <p style={{ color: 'var(--color-text)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', marginBottom: '2rem' }}>Experience the thrill of real-time bidding on exclusive, one-of-a-kind masterpieces.</p>

        <div ref={searchRef} style={{ maxWidth: '500px', margin: '0 auto', position: 'relative', zIndex: 50 }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search auctions by title..."
              className="search-bar"
              style={{ 
                width: '100%', 
                padding: '1.2rem 1.2rem 1.2rem 3.5rem', 
                borderRadius: '30px', 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                color: 'white',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease'
              }}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            <button type="submit" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
              <Search size={22} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </button>
          </form>

          {showDropdown && (historyToShow.length > 0 || categorySuggestions.length > 0) && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: 0,
              right: 0,
              background: 'rgba(30, 30, 35, 0.95)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '12px 0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              animation: 'fadeIn 0.2s ease-out',
              textAlign: 'left'
            }}>
              {categorySuggestions.length > 0 && (
                <div style={{ padding: '4px 0' }}>
                  <div style={{ padding: '6px 16px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-directory)', opacity: 0.8 }}>Suggested Categories</div>
                  {categorySuggestions.map(cat => (
                    <div 
                      key={cat} 
                      onClick={() => selectSuggestion(cat)}
                      style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: 'white', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Tag size={16} style={{ color: '#888' }} />
                      <span>{cat}</span>
                    </div>
                  ))}
                </div>
              )}

              {categorySuggestions.length > 0 && historyToShow.length > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }}></div>}

              {historyToShow.length > 0 && (
                <div style={{ padding: '4px 0' }}>
                  <div style={{ padding: '6px 16px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>Recent Searches</div>
                  {historyToShow.map((term, i) => (
                    <div 
                      key={i} 
                      onClick={() => selectSuggestion(term)}
                      style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <History size={16} style={{ color: '#666' }} />
                        <span>{term}</span>
                      </div>
                      <button 
                        onClick={(e) => removeFromHistory(e, term)}
                        style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={Array.isArray(auctions) && auctions.filter(auction => new Date(auction.endTime) > new Date() && auction.status === 'ACTIVE').length > 0 ? "grid" : ""}>
        {(() => {
          if (!Array.isArray(auctions)) return <div style={{ color: 'var(--color-text)', textAlign: 'center' }}>Loading auctions...</div>;
          const filtered = auctions.filter(auction => new Date(auction.endTime) > new Date() && auction.status === 'ACTIVE');
          if (filtered.length === 0) {
            return (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>No live auctions found</h3>
                <p style={{ color: 'var(--color-text)', opacity: 0.7 }}>Check back soon for exclusive masterpieces available for bidding.</p>
              </div>
            )
          }
          return filtered.map(auction => <AuctionCard key={auction.id} auction={auction} onBid={handleBid} />);
        })()}
      </div>
    </div>
  )
}

export default AuctionHouse
