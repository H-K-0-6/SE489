import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Package, DollarSign, Eye, TrendingUp, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function ArtisanDashboard() {
  const [data, setData] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', category: 'painting', price: '', stock: '', images: [], startingPrice: '', durationHours: 24 });
  const [listingType, setListingType] = useState('catalog');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = () => {
    if (!user) return;
    fetch(`http://localhost:3001/api/dashboard/artisan/${user.userId}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (newProduct.images.length + files.length > 5) {
      setImageError('You can only upload up to 5 images in total.');
      return;
    }

    setUploadingImage(true);
    setImageError('');
    const form = new FormData();
    files.forEach(file => form.append('images', file));

    try {
      const response = await fetch('http://localhost:3001/api/upload/multiple', {
        method: 'POST',
        body: form
      });
      const data = await response.json();
      if (response.ok) {
        setNewProduct(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
      } else {
        setImageError(data.error || 'Failed to upload images');
      }
    } catch (err) {
      setImageError('Error uploading images');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      let endpoint = 'http://localhost:3001/api/products';
      let payload = {
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        artisanId: user.userId,
        images: newProduct.images.length > 0 ? newProduct.images : [`https://picsum.photos/seed/${Math.random()}/600/400`]
      };

      if (listingType === 'auction') {
        endpoint = 'http://localhost:3001/api/auctions';
        payload = {
          title: newProduct.name,
          description: newProduct.description,
          category: newProduct.category,
          startingPrice: parseFloat(newProduct.startingPrice),
          durationHours: parseInt(newProduct.durationHours),
          artisanId: user.userId,
          images: newProduct.images.length > 0 ? newProduct.images : [`https://picsum.photos/seed/${Math.random()}/600/400`]
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert(`${listingType === 'auction' ? 'Auction' : 'Product'} created successfully!`);
        setShowAddProduct(false);
        setNewProduct({ name: '', description: '', category: 'painting', price: '', stock: '', images: [], startingPrice: '', durationHours: 24 });
        setListingType('catalog');
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create item');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div style={{ color: 'white', padding: '4rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="container" style={{ padding: '4rem 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', margin: 0 }}>Artisan Dashboard</h1>
        <button className="btn btn-recruitment" onClick={() => setShowAddProduct(!showAddProduct)}>
          <Plus size={20} /> Add Product
        </button>
      </div>

      {showAddProduct && (
        <div className="glass-panel" style={{ padding: '30px', marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '20px' }}>Create New Listing</h2>
          <form onSubmit={handleCreateProduct} style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button type="button" className={`btn ${listingType === 'catalog' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => setListingType('catalog')}>Standard Catalog</button>
              <button type="button" className={`btn ${listingType === 'auction' ? 'btn-recruitment' : 'btn-outline'}`} style={{ flex: 1, border: listingType !== 'auction' ? '1px solid var(--glass-border)' : 'none' }} onClick={() => setListingType('auction')}>Live Auction</button>
            </div>
            
            <input type="text" className="search-bar" style={{ width: '100%' }} placeholder={listingType === 'auction' ? "Auction Title" : "Product Name"} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
            <select className="search-bar" style={{ width: '100%' }} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
              <option value="painting">Painting</option>
              <option value="jewellery">Jewellery</option>
              <option value="pottery">Pottery</option>
              <option value="textiles">Textiles</option>
            </select>

            {listingType === 'catalog' ? (
              <>
                <input type="number" className="search-bar" style={{ width: '100%' }} placeholder="Price ($)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                <input type="number" className="search-bar" style={{ width: '100%' }} placeholder="Initial Stock" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
              </>
            ) : (
              <>
                <input type="number" className="search-bar" style={{ width: '100%' }} placeholder="Starting Price ($)" value={newProduct.startingPrice} onChange={e => setNewProduct({...newProduct, startingPrice: e.target.value})} required />
                <select className="search-bar" style={{ width: '100%' }} value={newProduct.durationHours} onChange={e => setNewProduct({...newProduct, durationHours: e.target.value})}>
                  <option value={12}>12 Hours</option>
                  <option value={24}>24 Hours</option>
                  <option value={48}>48 Hours</option>
                  <option value={72}>72 Hours</option>
                  <option value={168}>7 Days</option>
                </select>
              </>
            )}
            <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <label style={{ display: 'block', marginBottom: '12px', color: 'var(--color-text)' }}>Product Images (Up to 5)</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                {newProduct.images && newProduct.images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    {idx === 0 && <span style={{ position: 'absolute', top: 0, left: 0, background: 'var(--color-directory)', color: '#000', fontSize: '0.6rem', padding: '2px 6px', fontWeight: 'bold', zIndex: 2 }}>COVER</span>}
                    <button 
                      type="button"
                      onClick={() => setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                      style={{ position: 'absolute', top: -5, right: -5, background: 'var(--color-featured)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, fontSize: '12px' }}
                    >✕</button>
                    <img src={img} alt={`Preview ${idx}`} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                  </div>
                ))}
                {newProduct.images.length < 5 && (
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="search-bar" style={{ width: '100%', padding: '10px' }} />
                  </div>
                )}
              </div>
              {uploadingImage && <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-featured)' }}>Uploading...</div>}
              {imageError && <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-featured)' }}>{imageError}</div>}
            </div>
            <textarea className="search-bar" style={{ width: '100%', gridColumn: '1 / -1', minHeight: '100px', borderRadius: '12px' }} placeholder="Product Description" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} required />
            <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Publish Product</button>
          </form>
        </div>
      )}
      
      <div className="grid" style={{ marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 179, 0, 0.2)', padding: '16px', borderRadius: '50%', color: 'var(--color-directory)' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--color-text)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>
              ${data.sales?.reduce((sum, sale) => sum + (sale.priceAtBuy * sale.quantity), 0) || 0}
            </div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(229, 57, 53, 0.2)', padding: '16px', borderRadius: '50%', color: 'var(--color-featured)' }}>
            <Package size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--color-text)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Orders Processed</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>{data.sales?.length || 0}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(2, 136, 209, 0.2)', padding: '16px', borderRadius: '50%', color: 'var(--color-recruitment)' }}>
            <Eye size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--color-text)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Top Product Views</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>
              {data.topProducts?.[0]?.views || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={20} color="var(--color-directory)"/> Revenue Over Time</h3>
          <div style={{ height: '300px' }}>
            {data.chartData && data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-text)" tick={{ fill: 'var(--color-text)' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--color-text)" tick={{ fill: 'var(--color-text)' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip contentStyle={{ background: 'rgba(11, 12, 16, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                  <Line type="monotone" dataKey="revenue" stroke="url(#colorUv)" strokeWidth={4} dot={{ r: 4, fill: 'var(--color-directory)', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#FFB300" />
                      <stop offset="100%" stopColor="#FF5722" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            ) : <p>No revenue data yet.</p>}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Most Viewed Products</h3>
          <div style={{ height: '300px' }}>
            {data.topProducts && data.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topProducts} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" stroke="var(--color-text)" hide />
                  <YAxis dataKey="name" type="category" stroke="var(--color-text)" axisLine={false} tickLine={false} tick={{ fill: 'white' }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'rgba(11, 12, 16, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                  <Bar dataKey="views" fill="var(--color-recruitment)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p>No products yet.</p>}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Recent Orders</h3>
        {data.sales && data.sales.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--color-text)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Order ID</th>
                <th style={{ padding: '12px' }}>Product</th>
                <th style={{ padding: '12px' }}>Qty</th>
                <th style={{ padding: '12px' }}>Total</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.sales.map((sale) => (
                <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>{sale.order.id}</td>
                  <td style={{ padding: '16px 12px' }}>{sale.product.name}</td>
                  <td style={{ padding: '16px 12px' }}>{sale.quantity}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--color-directory)' }}>${sale.priceAtBuy * sale.quantity}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <select
                      value={sale.order.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          const res = await fetch(`http://localhost:3001/api/orders/${sale.order.id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: newStatus })
                          });
                          if (res.ok) {
                            alert(`Order status updated to ${newStatus}`);
                            fetchDashboardData();
                          } else {
                            const errData = await res.json().catch(() => ({}));
                            alert(`Failed to update order status: ${errData.error || res.statusText || 'Unknown Error'}. If this is a 404, please make sure you restarted the backend server (node index.js) after the last update.`);
                          }
                        } catch (err) {
                          console.error(err);
                          alert('Error connecting to the backend server. Is it running?');
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '50px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        background: sale.order.status === 'PENDING' ? 'rgba(255, 179, 0, 0.15)' : (sale.order.status === 'SHIPPED' ? 'rgba(2, 136, 209, 0.15)' : 'rgba(76, 175, 80, 0.15)'),
                        color: sale.order.status === 'PENDING' ? '#FFB300' : (sale.order.status === 'SHIPPED' ? 'var(--color-recruitment)' : '#4CAF50'),
                        border: '1px solid rgba(255,255,255,0.1)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="PENDING" style={{ background: '#111', color: '#FFB300' }}>PENDING</option>
                      <option value="SHIPPED" style={{ background: '#111', color: 'var(--color-recruitment)' }}>SHIPPED</option>
                      <option value="DELIVERED" style={{ background: '#111', color: '#4CAF50' }}>DELIVERED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No recent orders.</p>}
      </div>
    </div>
  );
}

export default ArtisanDashboard;
