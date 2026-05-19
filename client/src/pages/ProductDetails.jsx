import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Heart, ArrowLeft, Store, Eye } from 'lucide-react';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const fetchedId = React.useRef(null);

  useEffect(() => {
    if (fetchedId.current === id) return;
    fetchedId.current = id;

    // Record view in local storage for the catalog eye icon
    localStorage.setItem(`viewed_${id}`, 'true');

    // Fetch product details (backend increments views)
    fetch(`http://localhost:3001/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        const images = JSON.parse(data.images || '[]');
        if (images.length > 0) setMainImage(images[0]);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    if (user) {
      fetch(`http://localhost:3001/api/wishlist/${user.userId}`)
        .then(res => res.json())
        .then(data => setWishlist(data.map(item => item.productId)))
        .catch(console.error);
    }
  }, [id, user]);

  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login to add items to your cart.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/cart/${user.userId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
      if (response.ok) {
        alert('Added to cart!');
        setProduct({ ...product, stock: product.stock - 1 });
      } else {
        alert("Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      alert("Please login to use the wishlist.");
      return;
    }
    const isWishlisted = wishlist.includes(product.id);
    try {
      if (isWishlisted) {
        const response = await fetch(`http://localhost:3001/api/wishlist/${user.userId}/${product.id}`, { method: 'DELETE' });
        if (response.ok) setWishlist(prev => prev.filter(wid => wid !== product.id));
      } else {
        const response = await fetch(`http://localhost:3001/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.userId, productId: product.id })
        });
        if (response.ok) setWishlist(prev => [...prev, product.id]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '4rem', textAlign: 'center' }}>Loading details...</div>;
  if (error) return <div style={{ color: 'var(--color-featured)', padding: '4rem', textAlign: 'center' }}>{error}</div>;

  const images = JSON.parse(product.images || '[]');

  return (
    <div className="container" style={{ padding: '4rem 24px' }}>
      <button className="btn btn-outline" style={{ marginBottom: '2rem' }} onClick={() => navigate('/shop')}>
        <ArrowLeft size={18} /> Back to Catalog
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '4rem' }}>
        {/* Image Gallery */}
        <div>
          <div className="glass-panel" style={{ padding: '10px', marginBottom: '20px' }}>
            <img 
              src={mainImage || 'https://via.placeholder.com/600'} 
              alt={product.name} 
              style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '16px' }} 
            />
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

        {/* Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ textTransform: 'uppercase', color: 'var(--color-directory)', letterSpacing: '2px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>
            {product.category}
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', lineHeight: '1.2' }}>{product.name}</h1>
          <div style={{ fontSize: '3rem', fontWeight: '800', fontFamily: 'Playfair Display', color: 'var(--color-directory)', marginBottom: '20px', lineHeight: 1 }}>
            BD {product.price}
          </div>
          <p style={{ color: 'var(--color-text)', fontSize: '1.1rem', marginBottom: '30px', lineHeight: '1.8' }}>
            {product.description}
          </p>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem', color: product.stock < 3 ? 'var(--color-featured)' : 'var(--color-text)', fontWeight: 'bold' }}>
              {product.stock > 0 ? `${product.stock} pieces available` : 'Out of Stock'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 2, padding: '1rem', fontSize: '1.1rem' }} 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart size={20} /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button 
              className="btn btn-outline" 
              style={{ flex: 1, color: wishlist.includes(product.id) ? 'var(--color-featured)' : 'white' }} 
              onClick={handleToggleWishlist}
            >
              <Heart size={20} fill={wishlist.includes(product.id) ? 'var(--color-featured)' : 'none'} />
            </button>
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
            src={product.artisan?.profile?.avatarUrl || 'https://via.placeholder.com/150'} 
            alt="Artisan Avatar" 
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-directory)' }} 
          />
          <div>
            <h2 style={{ marginBottom: '8px' }}>{product.artisan?.name}</h2>
            {product.artisan?.profile?.shopName && (
              <div style={{ color: 'var(--color-recruitment)', fontWeight: 'bold', marginBottom: '16px' }}>
                Shop: {product.artisan.profile.shopName}
              </div>
            )}
            <p style={{ color: 'var(--color-text)', lineHeight: '1.7', marginBottom: '16px' }}>
              {product.artisan?.profile?.bio || "This artisan hasn't added a biography yet."}
            </p>
            {product.artisan?.email && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--glass-border)' }}>
                <span style={{ color: 'var(--color-text)' }}>Contact me: </span>
                <a href={`mailto:${product.artisan.email}`} style={{ color: 'var(--color-directory)', fontWeight: 'bold' }}>{product.artisan.email}</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
