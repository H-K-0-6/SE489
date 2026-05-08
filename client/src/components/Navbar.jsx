import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Heart, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/shop`);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-links">
          <Link to="/" className="brand-logo">Coop.</Link>
          <Link to="/shop" className="nav-link">Catalog</Link>
          <Link to="/auctions" className="nav-link">Live Auctions</Link>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search masterpieces..." 
              className="search-bar" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" style={{ background: 'none', border: 'none', padding: 0 }}>
              <Search size={18} style={{ position: 'absolute', right: '16px', top: '12px', color: '#888', cursor: 'pointer' }} />
            </button>
          </form>
          
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
