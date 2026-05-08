import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.role, data.userId);

      // Redirect based on role
      if (data.role === 'ADMIN') navigate('/dashboard/admin');
      else if (data.role === 'ARTISAN') navigate('/dashboard/artisan');
      else navigate('/dashboard/customer');
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '6rem 24px', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h1>
        
        {error && (
          <div style={{ background: 'rgba(229, 57, 53, 0.2)', border: '1px solid var(--color-featured)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="search-bar" 
                style={{ width: '100%', paddingLeft: '40px' }} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#888' }} />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="search-bar" 
                style={{ width: '100%', paddingLeft: '40px' }} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#888' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-text)' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: 'bold' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
