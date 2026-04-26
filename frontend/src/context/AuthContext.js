import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);

      return response.data;
    } catch (err) {
      throw err.response?.data || { message: 'Login failed' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await api.post('/auth/signup', {
        name,
        email,
        password
      });

      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);

      return response.data;
    } catch (err) {
      throw err.response?.data || { message: 'Signup failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      signup,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};