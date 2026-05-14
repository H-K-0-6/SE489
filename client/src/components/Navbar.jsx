import { ShoppingCart, Search, Heart, User, LogOut, History, X, Tag } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

import { Link, useNavigate, useLocation } from 'react-router-dom'

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState(JSON.parse(localStorage.getItem('globalSearchHistory') || '[]'));
  const searchRef = useRef(null);

  useEffect(() => {
    setSearchQuery('');
    setShowDropdown(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainCategories = ['Painting', 'Jewellery', 'Pottery', 'Textiles'];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/dashboard/admin';
    if (user.role === 'ARTISAN') return '/dashboard/artisan';
    return '/dashboard/customer';
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    const term = searchQuery.trim();
    if (term) {
      const updated = [term, ...searchHistory.filter(h => h !== term)].slice(0, 5);
      setSearchHistory(updated);
      localStorage.setItem('globalSearchHistory', JSON.stringify(updated));
      navigate(`/shop?search=${encodeURIComponent(term)}`);
    } else {
      navigate(`/shop`);
    }
    setShowDropdown(false);
  };

  const selectCategory = (cat) => {
    navigate(`/shop?category=${encodeURIComponent(cat.toLowerCase())}`);
    setShowDropdown(false);
  };

  const selectHistory = (term) => {
    setSearchQuery(term);
    const updated = [term, ...searchHistory.filter(h => h !== term)].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem('globalSearchHistory', JSON.stringify(updated));
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    setShowDropdown(false);
  };

  const removeFromHistory = (e, term) => {
    e.stopPropagation();
    const updated = searchHistory.filter(h => h !== term);
    setSearchHistory(updated);
    localStorage.setItem('globalSearchHistory', JSON.stringify(updated));
  };

  const historyToShow = searchQuery.trim().length > 0 
    ? searchHistory.filter(h => h.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : searchHistory.slice(0, 5);

  const suggestedCategories = searchQuery.trim().length > 0
    ? mainCategories.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    : mainCategories;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-links">
          <Link to="/" className="brand-logo">Coop.</Link>
          <Link to="/shop" className="nav-link">Catalog</Link>
          <Link to="/auctions" className="nav-link">Live Auctions</Link>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div ref={searchRef} style={{ position: 'relative', zIndex: 1000 }}>
            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search masterpieces..." 
                className="search-bar" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                style={{ width: '260px', paddingRight: '40px' }}
              />
              <button type="submit" style={{ background: 'none', border: 'none', padding: 0 }}>
                <Search size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#888', cursor: 'pointer' }} />
              </button>
            </form>

            {showDropdown && (suggestedCategories.length > 0 || historyToShow.length > 0) && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '280px',
                background: 'rgba(30, 30, 35, 0.98)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '8px 0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                textAlign: 'left'
              }}>
                {suggestedCategories.length > 0 && (
                  <div>
                    <div style={{ padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-directory)', opacity: 0.8 }}>Jump to Category</div>
                    {suggestedCategories.map(cat => (
                      <div 
                        key={cat} 
                        onClick={() => selectCategory(cat)}
                        style={{ padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', transition: 'background 0.2s', fontSize: '0.9rem' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Tag size={14} style={{ color: '#888' }} />
                        <span>{cat}</span>
                      </div>
                    ))}
                  </div>
                )}

                {suggestedCategories.length > 0 && historyToShow.length > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '6px 0' }}></div>}

                {historyToShow.length > 0 && (
                  <div>
                    <div style={{ padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888' }}>Recent</div>
                    {historyToShow.map((term, i) => (
                      <div 
                        key={i} 
                        onClick={() => selectHistory(term)}
                        style={{ padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', transition: 'background 0.2s', fontSize: '0.9rem' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <History size={14} style={{ color: '#666' }} />
                          <span>{term}</span>
                        </div>
                        <button 
                          onClick={(e) => removeFromHistory(e, term)}
                          style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Link to="/wishlist" style={{ color: 'var(--color-text)', position: 'relative' }}>
            <Heart size={24} />
          </Link>
          
          <Link to="/cart" style={{ color: 'var(--color-text)', position: 'relative' }}>
            <ShoppingCart size={24} />
          </Link>

          {user ? (
            <>
              <Link to={getDashboardLink()} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                <User size={18} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(229, 57, 53, 0.1)', color: 'var(--color-featured)' }}>
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
