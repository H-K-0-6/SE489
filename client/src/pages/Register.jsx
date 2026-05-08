import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Briefcase } from 'lucide-react';

function Register() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: searchParams.get('role') === 'ARTISAN' ? 'ARTISAN' : 'CUSTOMER',
    shopName: '',
    bio: '',
    avatarUrl: ''
  });
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const form = new FormData();
    form.append('image', file);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: form
      });
      const data = await response.json();
      if (response.ok) {
        setFormData(prev => ({ ...prev, avatarUrl: data.url }));
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch (err) {
      setError('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-login after registration could be done here, or redirect to login.
      // We will redirect to login for simplicity.
      navigate('/login');
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '6rem 24px', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h1>
        
        {error && (
          <div style={{ background: 'rgba(229, 57, 53, 0.2)', border: '1px solid var(--color-featured)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button 
              type="button"
              className={`btn ${formData.role === 'CUSTOMER' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1 }}
              onClick={() => setFormData({...formData, role: 'CUSTOMER'})}
            >
              Customer
            </button>
            <button 
              type="button"
              className={`btn ${formData.role === 'ARTISAN' ? 'btn-recruitment' : 'btn-outline'}`}
              style={{ flex: 1, border: formData.role !== 'ARTISAN' ? '1px solid var(--glass-border)' : 'none' }}
              onClick={() => setFormData({...formData, role: 'ARTISAN'})}
            >
              Artisan
            </button>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text)' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <input type="text" name="name" className="search-bar" style={{ width: '100%', paddingLeft: '40px' }} value={formData.name} onChange={handleChange} required />
              <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#888' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input type="email" name="email" className="search-bar" style={{ width: '100%', paddingLeft: '40px' }} value={formData.email} onChange={handleChange} required />
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#888' }} />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type="password" name="password" className="search-bar" style={{ width: '100%', paddingLeft: '40px' }} value={formData.password} onChange={handleChange} required />
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#888' }} />
            </div>
          </div>

          {formData.role === 'ARTISAN' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text)' }}>Shop Name</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" name="shopName" className="search-bar" style={{ width: '100%', paddingLeft: '40px' }} value={formData.shopName} onChange={handleChange} required />
                  <Briefcase size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#888' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text)' }}>Biography</label>
                <textarea name="bio" className="search-bar" style={{ width: '100%', minHeight: '100px', borderRadius: '12px' }} value={formData.bio} onChange={handleChange} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text)' }}>Profile Image</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {formData.avatarUrl && (
                    <img src={formData.avatarUrl} alt="Avatar Preview" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="search-bar" style={{ width: '100%', padding: '10px' }} />
                  </div>
                </div>
                {uploadingImage && <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-featured)' }}>Uploading...</div>}
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Register
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-text)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 'bold' }}>Sign In here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
