import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

function Home() {
  const [topArtisans, setTopArtisans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/artisans/top')
      .then(res => res.json())
      .then(data => {
        setTopArtisans(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <section className="section section-hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '800px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '50px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--color-directory)' }}>
              <Sparkles size={16} /> Discover the extraordinary
            </div>
            <h1 className="hero-title">
              Elevate Your Space With <span className="text-gradient">Local Masterpieces.</span>
            </h1>
            <p className="hero-subtitle">
              Join our artisan cooperative. Bid on exclusive fine art, purchase handcrafted goods, and support the local creative economy directly.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link to="/auctions" className="btn btn-primary">
                Enter Auction House <ArrowRight size={18} />
              </Link>
              <Link to="/shop" className="btn btn-outline">
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h2 style={{ fontSize: '3rem', marginBottom: '8px' }}>Top Artisans</h2>
              <p style={{ color: 'var(--color-text)' }}>Meet the brilliant minds behind the crafts.</p>
            </div>
            <Link to="/artisans" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
              View all artisans <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid">
            {loading ? (
              <div style={{ color: 'white', textAlign: 'center', gridColumn: '1/-1' }}>Loading top artisans...</div>
            ) : topArtisans.length === 0 ? (
              <div style={{ color: 'var(--color-text)', textAlign: 'center', gridColumn: '1/-1' }}>No artisans found.</div>
            ) : (
              topArtisans.map((artisan, index) => (
                <div key={artisan.id} className="card" style={{ height: '400px' }}>
                  <div className="card-img-wrapper" style={{ height: '100%' }}>
                    <img 
                      src={artisan.profile?.avatarUrl || `https://picsum.photos/seed/${artisan.id}/400/500`} 
                      alt={artisan.name} 
                      style={{ height: '100%', width: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div className="card-body" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', paddingTop: '60px' }}>
                    <h3 className="card-title" style={{ marginBottom: '4px', color: 'white' }}>{artisan.name}</h3>
                    <p style={{ color: 'var(--color-directory)', margin: 0, fontWeight: '600' }}>
                      {artisan.profile?.shopName || 'Independent Creator'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--color-surface)' }}>
        <div className="container">
          <div className="glass-panel" style={{ textAlign: 'center', background: 'rgba(2, 136, 209, 0.1)', borderColor: 'rgba(2, 136, 209, 0.3)' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '16px' }}>Are you a creator?</h2>
            <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 32px' }}>
              Join the cooperative to get your own storefront, run live auctions, and access powerful analytics dashboards to grow your business.
            </p>
            <Link to="/register?role=ARTISAN" className="btn btn-recruitment" style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'inline-block', textDecoration: 'none' }}>
              Apply as Artisan
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
