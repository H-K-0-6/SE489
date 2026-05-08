import React, { useState, useEffect } from 'react';
import { Package, Heart, Clock, CheckCircle, Gavel, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [bids, setBids] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Fetch orders
      fetch(`http://localhost:3001/api/orders/user/${user.userId}`)
        .then(res => res.json())
        .then(setOrders)
        .catch(console.error);

      // Fetch bids
      fetch(`http://localhost:3001/api/dashboard/customer/${user.userId}/bids`)
        .then(res => res.json())
        .then(setBids)
        .catch(console.error);
    }
  }, [user]);

  const mockWishlist = [
    { id: '1', name: 'Classical Masterpiece', price: 200, artisan: 'Elena Rossi', image: '/art/art1.png' },
    { id: '2', name: 'Starry Night Replica', price: 850, artisan: 'John Doe', image: '/art/art2.png' },
  ];

  const renderProgressBar = (status) => {
    let progress = 0;
    if (status === 'PENDING') progress = 25;
    if (status === 'SHIPPED') progress = 65;
    if (status === 'DELIVERED') progress = 100;

    return (
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--color-text)', textTransform: 'uppercase' }}>
          <span style={{ color: progress >= 25 ? 'var(--color-directory)' : '' }}>Processing</span>
          <span style={{ color: progress >= 65 ? 'var(--color-directory)' : '' }}>Shipped</span>
          <span style={{ color: progress === 100 ? 'var(--color-directory)' : '' }}>Delivered</span>
        </div>
        <div style={{ height: '6px', background: 'var(--glass-border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-accent-gradient)', transition: 'width 1s ease-in-out' }}></div>
        </div>
      </div>
    );
  };

  if (!user) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Please login to view dashboard.</div>;
  }

  return (
    <div className="container" style={{ padding: '4rem 24px', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>My Account</h1>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('orders')}
          className="btn" 
          style={{ background: activeTab === 'orders' ? 'white' : 'transparent', color: activeTab === 'orders' ? 'black' : 'white', border: '1px solid var(--glass-border)' }}
        >
          <Package size={18} /> Order History
        </button>
        <button 
          onClick={() => setActiveTab('bids')}
          className="btn" 
          style={{ background: activeTab === 'bids' ? 'white' : 'transparent', color: activeTab === 'bids' ? 'black' : 'white', border: '1px solid var(--glass-border)' }}
        >
          <Gavel size={18} /> My Bids
        </button>
        <button 
          onClick={() => setActiveTab('wishlist')}
          className="btn" 
          style={{ background: activeTab === 'wishlist' ? 'white' : 'transparent', color: activeTab === 'wishlist' ? 'black' : 'white', border: '1px solid var(--glass-border)' }}
        >
          <Heart size={18} /> Saved Wishlist
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ marginBottom: '24px' }}>Recent Orders</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {orders.length === 0 ? <p>No orders found.</p> : orders.map(order => (
              <div key={order.id} style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Order {order.id}</h3>
                    <div style={{ color: 'var(--color-text)', fontSize: '0.9rem', marginTop: '4px' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-directory)' }}>${order.total.toFixed(2)}</div>
                    <a href="#" style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>View Tax Invoice (PDF)</a>
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: 'var(--glass-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} color="var(--color-text)" /></div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{item.product?.name || 'Unknown Product'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text)' }}>Qty: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {renderProgressBar(order.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bids' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ marginBottom: '24px' }}>My Bidding History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bids.length === 0 ? <p>You haven't placed any bids yet.</p> : bids.map(bid => {
              const isWinner = bid.auction.status === 'CLOSED' && bid.amount === bid.auction.currentBid;
              const isOutbid = bid.auction.status === 'ACTIVE' && bid.amount < bid.auction.currentBid;
              
              return (
                <div key={bid.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--glass-border)', borderRadius: '12px', background: isWinner ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.02)' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{bid.auction.title}</h3>
                    <div style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>
                      Placed on {new Date(bid.timestamp).toLocaleString()}
                    </div>
                    {isWinner && (
                      <div style={{ color: '#4CAF50', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                        <Trophy size={16} /> YOU WON THIS AUCTION!
                      </div>
                    )}
                    {isOutbid && (
                      <div style={{ color: 'var(--color-featured)', fontSize: '0.85rem', marginTop: '4px' }}>
                        You have been outbid! Current high bid: ${bid.auction.currentBid}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text)', textTransform: 'uppercase' }}>Your Bid</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isWinner ? '#4CAF50' : 'white' }}>${bid.amount}</div>
                    <div style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--glass-bg)', display: 'inline-block', marginTop: '8px' }}>
                      {bid.auction.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div>
          <h2 style={{ marginBottom: '24px' }}>My Wishlist</h2>
          <div className="grid">
            {mockWishlist.map(item => (
              <div key={item.id} className="card">
                <div className="card-img-wrapper">
                  <img src={item.image} alt={item.name} />
                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <button style={{ background: 'var(--color-featured)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><Heart size={18} fill="white" /></button>
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{item.name}</h3>
                  <div style={{ color: 'var(--color-text)', fontSize: '0.9rem', marginBottom: '16px' }}>By {item.artisan}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div className="card-price" style={{ margin: 0 }}>${item.price}</div>
                    <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default CustomerDashboard;
