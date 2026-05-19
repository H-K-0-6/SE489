import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Forgot Password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link.');
      }

      setForgotSuccess(data.message || 'We have sent a secure password reset link to your email.');
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '6rem 24px', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px' }}>
        
        {!showForgot ? (
          <>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: 'var(--color-text)', margin: 0 }}>Password</label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowForgot(true);
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--color-featured)', 
                      cursor: 'pointer', 
                      fontSize: '0.85rem', 
                      padding: 0,
                      fontWeight: '500'
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
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
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: forgotSuccess ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 179, 0, 0.15)',
                color: forgotSuccess ? '#4CAF50' : 'var(--color-directory)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: `1px solid ${forgotSuccess ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 179, 0, 0.3)'}`
              }}>
                {forgotSuccess ? <CheckCircle2 size={28} /> : <KeyRound size={28} />}
              </div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Forgot Password?</h1>
              <p style={{ color: 'var(--color-text)', fontSize: '0.9rem', margin: 0, opacity: 0.8, lineHeight: 1.4 }}>
                {forgotSuccess 
                  ? 'Please check your inbox to proceed.' 
                  : "Enter your registered email address and we'll send you a secure link to reset your password."}
              </p>
            </div>

            {forgotError && (
              <div style={{ background: 'rgba(229, 57, 53, 0.2)', border: '1px solid var(--color-featured)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div style={{ background: 'rgba(76, 175, 80, 0.2)', border: '1px solid #4CAF50', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem', lineHeight: 1.4 }}>
                {forgotSuccess}
              </div>
            )}

            {!forgotSuccess ? (
              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text)' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="email" 
                      className="search-bar" 
                      style={{ width: '100%', paddingLeft: '40px' }} 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required 
                    />
                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#888' }} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={forgotLoading}>
                  {forgotLoading ? 'Sending Link...' : 'Send Reset Link'}
                </button>
              </form>
            ) : null}

            <button 
              type="button" 
              onClick={() => setShowForgot(false)}
              className="btn"
              style={{ 
                width: '100%', 
                marginTop: '16px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default Login;
