import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  const updateAuth = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  const signIn = async (email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { user: null, error: data.message || 'Login failed' };
      }

      updateAuth(data.user, data.token);
      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: 'Network error' };
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { user: null, error: data.message || 'Registration failed' };
      }

      updateAuth(data.user, data.token);
      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: 'Network error' };
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isSubscriptionActive = () => {
    if (!user || user.role === 'admin') return true;

    const expiryDate = user.subscription?.expiryDate || user.subscription_end;
    if (!expiryDate) return false;

    return new Date(expiryDate) > new Date();
  };

  const extendSubscription = () => {
    if (user) {
      const newExpiryDate = new Date();
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1); // سنة واحدة

      const updatedUser = {
        ...user,
        subscription: {
          ...user.subscription,
          expiryDate: newExpiryDate.toISOString(),
        },
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshUserData = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        updateAuth(data.user, token);
      }
    } catch (err) {
      console.error('Failed to refresh user data', err);
    }
  };

  const fetchCurrentUser = async (jwtToken) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch user');

    const data = await res.json();
    updateAuth(data.user, jwtToken);
  } catch (err) {
    console.error('🔴 Error in fetchCurrentUser:', err);
  }
};


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signUp,
        signOut,
        isSubscriptionActive,
        extendSubscription,
        refreshUserData, // ⬅ مهم بعد الدفع
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
