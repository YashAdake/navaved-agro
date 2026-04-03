import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('navaved_token');
    if (token) {
      // Decode token to check expiry
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000;
        if (payload.exp && payload.exp > now) {
          setUser({
            user_id: payload.user_id,
            email: payload.email,
            role: payload.role,
            user_name: payload.email.split('@')[0],
          });
          // Set auto-logout timer
          const msUntilExpiry = (payload.exp - now) * 1000;
          const timer = setTimeout(() => logout(), msUntilExpiry);
          setLoading(false);
          return () => clearTimeout(timer);
        } else {
          localStorage.removeItem('navaved_token');
        }
      } catch {
        localStorage.removeItem('navaved_token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await API.login(email, password);
    const { access_token, user: userData } = res.data;

    localStorage.setItem('navaved_token', access_token);
    setUser(userData);

    // Set auto-logout timer
    try {
      const payload = JSON.parse(atob(access_token.split('.')[1]));
      const msUntilExpiry = (payload.exp - Date.now() / 1000) * 1000;
      setTimeout(() => logout(), msUntilExpiry);
    } catch { /* ignore */ }

    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('navaved_token');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
