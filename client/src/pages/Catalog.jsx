import React, { useEffect, useState, useRef } from 'react'
import { ShoppingCart, Heart, Search, Eye, X, Tag, History } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'

function Catalog() {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('')
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const searchQuery = searchParams.get('search') || ''
  const [wishlist, setWishlist] = useState([])
  
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [searchHistory, setSearchHistory] = useState(JSON.parse(localStorage.getItem('catalogSearchHistory') || '[]'))
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
      const updated = [searchInput.trim(), ...searchHistory.filter(h => h !== searchInput.trim())].slice(0, 5);
      setSearchHistory(updated);
      localStorage.setItem('catalogSearchHistory', JSON.stringify(updated));
    } else {
      params.delete('search');
    }
    setSearchParams(params);
    setShowDropdown(false);
  }

  const selectSuggestion = (val) => {
    setSearchInput(val);
    const params = new URLSearchParams(searchParams);
    params.set('search', val);
    setSearchParams(params);

    const updated = [val.trim(), ...searchHistory.filter(h => h !== val.trim())].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem('catalogSearchHistory', JSON.stringify(updated));
    setShowDropdown(false);
  }

  const removeFromHistory = (e, term) => {
    e.stopPropagation();
    const updated = searchHistory.filter(h => h !== term);
    setSearchHistory(updated);
    localStorage.setItem('catalogSearchHistory', JSON.stringify(updated));
  }

  const categories = [...new Set(products.map(p => p.category))];
  const categorySuggestions = searchInput.length > 0 
    ? categories.filter(cat => cat.toLowerCase().includes(searchInput.toLowerCase())).slice(0, 3)
    : [];
  
  const historyToShow = searchInput.length > 0
    ? searchHistory.filter(h => h.toLowerCase().includes(searchInput.toLowerCase())).slice(0, 3)
    : searchHistory.slice(0, 5);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:3001/api/wishlist/${user.userId}`)
        .then(res => res.json())
        .then(data => setWishlist(data.map(item => item.productId)))
        .catch(err => console.error(err))
    } else {
      setWishlist([])
    }
  }, [user])

  useEffect(() => {
    let url = 'http://localhost:3001/api/products'
    const params = new URLSearchParams()
    
    if (category) params.append('category', category)
    if (searchQuery) params.append('search', searchQuery)
      
    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err))
  }, [category, searchQuery])

  const handleAddToCart = async (productId) => {
    if (!user) {
      alert("Please login to add items to your cart.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/cart/${user.userId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      if (response.ok) {
        setProducts(prevProducts => prevProducts.map(p => 
          p.id === productId ? { ...p, stock: p.stock - 1 } : p
        ));
      }
      else alert("Failed to add to cart");
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (!user) {
      alert("Please login to use the wishlist.");
      return;
    }

    const isWishlisted = wishlist.includes(productId);
    try {
      if (isWishlisted) {
        const response = await fetch(`http://localhost:3001/api/wishlist/${user.userId}/${productId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setWishlist(prev => prev.filter(id => id !== productId));
        }
      } else {
        const response = await fetch(`http://localhost:3001/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.userId, productId })
        });
        if (response.ok) {
          setWishlist(prev => [...prev, productId]);
        } else {
          const data = await response.json();
          alert(data.error || "Failed to add to wishlist");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '10px' }}>Curated Catalog</h1>
          <p style={{ color: 'var(--color-text)', fontSize: '1.2rem' }}>Explore unique handcrafted pieces directly from the artisans.</p>
        </div>

        <div ref={searchRef} style={{ width: '100%', maxWidth: '350px', position: 'relative', zIndex: 50 }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search catalog..."
              className="search-bar"
              style={{ 
                width: '100%', 
                padding: '0.8rem 1rem 0.8rem 3rem', 
                borderRadius: '25px', 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                color: 'white',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            <button type="submit" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
              <Search size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </button>
            {searchInput && (
              <button 
                type="button" 
                onClick={() => {
                  setSearchInput('');
                  const params = new URLSearchParams(searchParams);
                  params.delete('search');
                  setSearchParams(params);
                }}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#666' }}
              >
                <X size={16} />
              </button>
            )}
          </form>

          {showDropdown && (historyToShow.length > 0 || categorySuggestions.length > 0) && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'rgba(30, 30, 35, 0.95)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '8px 0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              textAlign: 'left'
            }}>
              {categorySuggestions.length > 0 && (
                <div>
                  <div style={{ padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-directory)', opacity: 0.8 }}>Suggested Categories</div>
                  {categorySuggestions.map(cat => (
                    <div 
                      key={cat} 
                      onClick={() => selectSuggestion(cat)}
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

              {categorySuggestions.length > 0 && historyToShow.length > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '6px 0' }}></div>}

              {historyToShow.length > 0 && (
                <div>
                  <div style={{ padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#888' }}>Recent Searches</div>
                  {historyToShow.map((term, i) => (
                    <div 
                      key={i} 
                      onClick={() => selectSuggestion(term)}
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
      </div>
      
      <div className="filter-tabs">
        <button className={`filter-btn ${category === '' ? 'active' : ''}`} onClick={() => setCategory('')}>All Pieces</button>
        <button className={`filter-btn ${category === 'painting' ? 'active' : ''}`} onClick={() => setCategory('painting')}>Paintings</button>
        <button className={`filter-btn ${category === 'jewellery' ? 'active' : ''}`} onClick={() => setCategory('jewellery')}>Jewellery</button>
        <button className={`filter-btn ${category === 'pottery' ? 'active' : ''}`} onClick={() => setCategory('pottery')}>Pottery</button>
        <button className={`filter-btn ${category === 'textiles' ? 'active' : ''}`} onClick={() => setCategory('textiles')}>Textiles</button>
      </div>

      <div className="grid">
        {products.filter(p => p.stock > 0).map(product => {
          const images = JSON.parse(product.images || '[]')
          const isViewed = localStorage.getItem(`viewed_${product.id}`) === 'true';
          return (
            <div key={product.id} className="card">
              <div className="card-img-wrapper">
                <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                  <img src={images[0] || 'https://via.placeholder.com/400'} alt={product.name} />
                </Link>
                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleToggleWishlist(product.id)}
                    style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: wishlist.includes(product.id) ? 'var(--color-featured)' : 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                  >
                    <Heart size={18} fill={wishlist.includes(product.id) ? 'var(--color-featured)' : 'none'} />
                  </button>
                  <Link to={`/product/${product.id}`} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: isViewed ? 'var(--color-recruitment)' : 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)', display: 'flex' }}><Eye size={18} /></Link>
                </div>
              </div>
              <div className="card-body">
                <div className="card-category">{product.category}</div>
                <h3 className="card-title">
                  <Link to={`/product/${product.id}`} style={{ color: 'inherit' }}>{product.name}</Link>
                </h3>
                <p style={{ color: 'var(--color-text)', fontSize: '0.9rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {product.description}
                </p>
                
                <div className="card-artisan">
                  <img src={product.artisan?.profile?.avatarUrl || 'https://via.placeholder.com/40'} alt="avatar" className="artisan-avatar" style={{ width: '24px', height: '24px', borderWidth: '1px' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>By {product.artisan?.name}</span>
                </div>
                
                <div className="card-price">${product.price}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: product.stock < 3 ? 'var(--color-featured)' : 'var(--color-text)', fontWeight: '600' }}>
                    {product.stock} left in stock
                  </span>
                  <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }} onClick={() => handleAddToCart(product.id)}>
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Catalog
