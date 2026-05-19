import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';

const API = 'http://localhost:3001/api/auth';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetToken) {
      setError('A valid reset token is required. Please check your reset link.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password. Your token may have expired.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '6rem 24px', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: success ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 179, 0, 0.15)',
            color: success ? '#4CAF50' : 'var(--color-directory)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: `1px solid ${success ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 179, 0, 0.3)'}`
          }}>
            {success ? <CheckCircle2 size={28} /> : <KeyRound size={28} />}
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
            {success ? 'Password Updated' : 'Set New Password'}
          </h1>
          <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', margin: 0, opacity: 0.8 }}>
            {success 
              ? 'Your account password has been successfully reset.' 
              : 'Please enter your strong new password below to secure your account.'}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(229, 57, 53, 0.2)', 
            border: '1px solid var(--color-featured)', 
            color: '#FFF', 
            padding: '12px', 
            borderRadius: '10px', 
            marginBottom: '20px', 
            textAlign: 'center',
            fontSize: '0.9rem' 
          }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '1rem' }}>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
              Proceed to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Optional manual token entry if token is missing from URL */}
            {!tokenFromUrl && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text)', fontSize: '0.9rem' }}>
                  Reset Token
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="search-bar" 
                    style={{ width: '100%', paddingLeft: '40px' }} 
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste your reset token"
                    required 
                  />
                  <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#888' }} />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text)', fontSize: '0.9rem' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="search-bar" 
                  style={{ width: '100%', paddingLeft: '40px', paddingRight: '44px' }} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, upper, lower, number"
                  required 
                />
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#888' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text)', opacity: 0.7, marginTop: '8px', lineHeight: 1.4 }}>
                Requirements: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text)', fontSize: '0.9rem' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="search-bar" 
                  style={{ width: '100%', paddingLeft: '40px' }} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required 
                />
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#888' }} />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '1rem', marginTop: '8px', fontSize: '1.02rem' }}
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default ResetPassword;
