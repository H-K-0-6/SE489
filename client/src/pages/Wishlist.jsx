import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchWishlist()
    }
  }, [user])

  const fetchWishlist = () => {
    fetch(`http://localhost:3001/api/wishlist/${user.userId}`)
      .then(res => res.json())
      .then(data => {
        setWishlistItems(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const handleRemove = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/wishlist/${user.userId}/${productId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.productId !== productId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/cart/${user.userId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      if (response.ok) {
        alert("Added to cart!");
      } else {
        alert("Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container" style={{ padding: '4rem 24px' }}>Loading...</div>

  return (
    <div className="container" style={{ padding: '4rem 24px' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '10px' }}>Your Wishlist</h1>
        <p style={{ color: 'var(--color-text)', fontSize: '1.2rem' }}>Pieces you've saved for later.</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
          <Heart size={48} style={{ color: 'var(--color-text)', marginBottom: '1rem', opacity: 0.5 }} />
          <h2>Your wishlist is empty</h2>
          <p style={{ color: 'var(--color-text)', marginTop: '1rem', marginBottom: '2rem' }}>You haven't saved any masterpieces yet.</p>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Explore Catalog</Link>
        </div>
      ) : (
        <div className="grid">
          {wishlistItems.map(({ product }) => {
            const images = JSON.parse(product.images || '[]')
            return (
              <div key={product.id} className="card">
                <div className="card-img-wrapper">
                  <img src={images[0] || 'https://via.placeholder.com/400'} alt={product.name} />
                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <button 
                      onClick={() => handleRemove(product.id)}
                      style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'var(--color-featured)', padding: '8px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                      title="Remove from Wishlist"
                    >
                      <Heart size={18} fill="var(--color-featured)" />
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-category">{product.category}</div>
                  <h3 className="card-title">{product.name}</h3>
                  <div className="card-price" style={{ margin: '12px 0' }}>${product.price}</div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ flexGrow: 1, padding: '0.8rem' }} 
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart size={16} /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Wishlist
