import React, { useEffect, useState } from 'react';
import { Trash2, CreditCard, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = () => {
    fetch(`http://localhost:3001/api/cart/${user.userId}`)
      .then(res => res.json())
      .then(data => setCartItems(data.items || []))
      .catch(console.error);
  };

  const removeItem = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/cart/${user.userId}/remove/${productId}`, {
        method: 'DELETE'
      });
      if (response.ok) fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert(`Checkout successful! Order ${data.orderId} generated.\nTax Invoice PDF simulated locally.`);
        fetchCart(); // This will pull the now-empty cart
      } else {
        alert("Checkout failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 24px', textAlign: 'center' }}>
        <h2>Please log in to view your cart</h2>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px' }}>Log In</Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div className="container" style={{ padding: '4rem 24px', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '2rem' }}>Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Your cart is empty</h2>
          <p style={{ color: 'var(--color-text)', marginBottom: '2rem' }}>Discover unique handcrafted items in our catalog.</p>
          <Link to="/shop" className="btn btn-primary">Browse Catalog</Link>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cartItems.map(item => {
              const images = JSON.parse(item.product.images || '[]');
              return (
                <div key={item.id} className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <img src={images[0] || 'https://via.placeholder.com/100'} alt={item.product.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px' }} />
                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>{item.product.name}</h3>
                    <div style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Category: {item.product.category}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-directory)', marginTop: '8px' }}>${item.product.price}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 'bold' }}>Qty: {item.quantity}</span>
                  </div>
                  <button onClick={() => removeItem(item.product.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-featured)', cursor: 'pointer', padding: '8px' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })}
          </div>
          
          <div>
            <div className="glass-panel" style={{ padding: '32px', position: 'sticky', top: '100px' }}>
              <h2 style={{ marginBottom: '24px' }}>Order Summary</h2>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--color-text)' }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--color-text)' }}>
                <span>Tax (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--glass-border)', margin: '20px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-directory)' }}>${total.toFixed(2)}</span>
              </div>
              
              <button onClick={handleCheckout} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginBottom: '16px' }}>
                <CreditCard size={20} /> Secure Checkout
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)', fontSize: '0.8rem', justifyContent: 'center' }}>
                <ShieldCheck size={16} color="#4CAF50" /> PCI-DSS Compliant Payment
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
