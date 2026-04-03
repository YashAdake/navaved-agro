import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/dashboard/products', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard/products', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | NAVAVED Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <img src="/assets/logo/logo.png" alt="NAVAVED" className="login-logo" />
              <h1>Admin Dashboard</h1>
              <p>Sign in to manage products &amp; stores</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error">
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email"><i className="fas fa-envelope"></i> Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="password"><i className="fas fa-lock"></i> Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                {loading ? (
                  <><div className="btn-spinner"></div> Signing in...</>
                ) : (
                  <><i className="fas fa-sign-in-alt"></i> Sign In</>
                )}
              </button>
            </form>

            <a href="/" className="login-back"><i className="fas fa-arrow-left"></i> Back to Website</a>
          </div>
        </div>
      </div>

      <style>{`
        .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 20px; }
        .login-container { width: 100%; max-width: 420px; }
        .login-card { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border-radius: 20px; padding: 48px 36px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 60px rgba(0,0,0,0.3); }
        .login-header { text-align: center; margin-bottom: 32px; }
        .login-logo { width: 80px; height: 80px; object-fit: contain; margin-bottom: 16px; border-radius: 12px; }
        .login-header h1 { color: #fff; font-family: 'Playfair Display', serif; font-size: 1.8rem; margin-bottom: 8px; }
        .login-header p { color: rgba(255,255,255,0.6); font-size: 0.95rem; }
        .login-form .form-group { margin-bottom: 20px; }
        .login-form label { display: block; color: rgba(255,255,255,0.7); font-size: 0.85rem; margin-bottom: 8px; font-weight: 500; }
        .login-form label i { margin-right: 6px; }
        .login-form input { width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: #fff; font-size: 1rem; transition: all 0.3s; outline: none; box-sizing: border-box; }
        .login-form input:focus { border-color: #c8a97e; background: rgba(255,255,255,0.12); box-shadow: 0 0 0 3px rgba(200,169,126,0.15); }
        .login-form input::placeholder { color: rgba(255,255,255,0.3); }
        .login-btn { width: 100%; padding: 14px; font-size: 1rem; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px; }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-error { background: rgba(231,76,60,0.15); border: 1px solid rgba(231,76,60,0.3); color: #e74c3c; padding: 12px 16px; border-radius: 10px; font-size: 0.9rem; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        .login-back { display: block; text-align: center; color: rgba(255,255,255,0.5); margin-top: 24px; text-decoration: none; font-size: 0.9rem; transition: color 0.3s; }
        .login-back:hover { color: #c8a97e; }
      `}</style>
    </>
  );
}
