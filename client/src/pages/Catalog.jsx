import React, { useEffect, useState } from 'react'
import { ShoppingCart, Heart, Search, Eye, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'

function Catalog() {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('')
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const searchQuery = searchParams.get('search')
  const [wishlist, setWishlist] = useState([])

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
