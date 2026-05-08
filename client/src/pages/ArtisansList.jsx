import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ArtisansList() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/artisans')
      .then(res => res.json())
      .then(data => {
        setArtisans(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container" style={{ padding: '4rem 24px' }}>
      <button className="btn btn-outline" style={{ marginBottom: '2rem' }} onClick={() => navigate('/')}>
        <ArrowLeft size={18} /> Back to Home
      </button>

      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '8px' }}>Our Artisans</h1>
        <p style={{ color: 'var(--color-text)', fontSize: '1.1rem' }}>Meet the incredibly talented creators behind our handcrafted collections.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Loading artisans...</div>
        ) : artisans.length === 0 ? (
          <div style={{ color: 'var(--color-text)', textAlign: 'center', padding: '2rem' }}>No artisans found.</div>
        ) : (
          artisans.map(artisan => (
            <div 
              key={artisan.id} 
              className="glass-panel" 
              style={{ 
                display: 'flex', 
                gap: '30px', 
                alignItems: 'center', 
                padding: '30px', 
                borderRadius: '16px',
                flexWrap: 'wrap'
              }}
            >
              <img 
                src={artisan.profile?.avatarUrl || 'https://via.placeholder.com/150'} 
                alt={artisan.name} 
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  border: '3px solid var(--color-directory)' 
                }} 
              />
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h2 style={{ marginBottom: '4px', fontSize: '1.8rem' }}>{artisan.name}</h2>
                {artisan.profile?.shopName && (
                  <div style={{ color: 'var(--color-recruitment)', fontWeight: 'bold', marginBottom: '12px' }}>
                    Shop: {artisan.profile.shopName}
                  </div>
                )}
                <p style={{ color: 'var(--color-text)', marginBottom: '20px', lineHeight: '1.6' }}>
                  {artisan.profile?.bio || "This artisan hasn't added a biography yet."}
                </p>
                {artisan.email && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--glass-border)' }}>
                    <span style={{ color: 'var(--color-text)' }}>Contact me: </span>
                    <a href={`mailto:${artisan.email}`} style={{ color: 'var(--color-directory)', fontWeight: 'bold' }}>{artisan.email}</a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ArtisansList;
