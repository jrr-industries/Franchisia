import { createContext, useContext, useState, useEffect } from 'react';

const API = 'http://localhost:3001/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const text = await res.text();
      let err;
      try { err = JSON.parse(text); } catch { err = { error: text || 'Login failed' }; }
      throw new Error(err.error || err.message || 'Login failed');
    }
    const data = await res.json();
    const sessionToken = data.session?.token || data.token;
    setUser(data.user);
    setToken(sessionToken);
    localStorage.setItem('token', sessionToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  const signup = async (userData) => {
    const res = await fetch(`${API}/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const text = await res.text();
      let err;
      try { err = JSON.parse(text); } catch { err = { error: text || 'Signup failed' }; }
      throw new Error(err.error || err.message || 'Signup failed');
    }
    const data = await res.json();
    const sessionToken = data.session?.token || data.token;
    setUser(data.user);
    setToken(sessionToken);
    localStorage.setItem('token', sessionToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  const logout = async () => {
    if (token) {
      await fetch(`${API}/auth/sign-out`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const sendEmailOtp = async () => {
    const res = await fetch(`${API}/auth/send-email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send OTP');
    }
    return res.json();
  };

  const verifyEmail = async (otp) => {
    const res = await fetch(`${API}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ otp }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Email verification failed');
    }
    const data = await res.json();
    updateUser(data.user);
    return data;
  };

  const sendPhoneOtp = async (phone) => {
    const res = await fetch(`${API}/auth/send-phone-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send OTP');
    }
    return res.json();
  };

  const verifyPhone = async (otp) => {
    const res = await fetch(`${API}/auth/verify-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ otp }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Phone verification failed');
    }
    const data = await res.json();
    updateUser(data.user);
    return data;
  };

  const selectRole = async (role) => {
    const res = await fetch(`${API}/auth/select-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Role selection failed');
    }
    const data = await res.json();
    updateUser(data.user);
    return data;
  };

  const updateOnboarding = async (role, data) => {
    const res = await fetch(`${API}/onboarding/${role}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Update failed');
    }
    const result = await res.json();
    if (result.user) updateUser(result.user);
    return result;
  };

  const uploadDocument = async (docData) => {
    const res = await fetch(`${API}/onboarding/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(docData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Document upload failed');
    }
    return res.json();
  };

  const submitForReview = async () => {
    const res = await fetch(`${API}/onboarding/submit-for-review`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Submission failed');
    }
    const data = await res.json();
    if (data.user) updateUser(data.user);
    return data;
  };

  const fetchAuthStatus = async () => {
    const res = await fetch(`${API}/auth/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch status');
    const data = await res.json();
    updateUser(data);
    return data;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: !!user, isAdmin, loading,
      login, signup, logout,
      sendEmailOtp, verifyEmail, sendPhoneOtp, verifyPhone,
      selectRole, updateOnboarding, uploadDocument, submitForReview,
      fetchAuthStatus, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
