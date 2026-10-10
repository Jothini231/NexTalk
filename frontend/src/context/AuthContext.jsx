import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { getToken, setToken, setUser, getUser, clearAuth } from '../utils/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUserState(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token: newToken, ...userData } = response.data;
    setToken(newToken);
    setUser(userData);
    setTokenState(newToken);
    setUserState(userData);
    return response.data;
  }, []);

  const register = useCallback(async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token: newToken, ...userInfo } = response.data;
    setToken(newToken);
    setUser(userInfo);
    setTokenState(newToken);
    setUserState(userInfo);
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      setTokenState(null);
      setUserState(null);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUserState(response.data);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch user error:', error);
    }
  }, []);

  const updateUserState = useCallback((updatedUser) => {
    setUserState(updatedUser);
    setUser(updatedUser);
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      fetchCurrentUser,
      updateUserState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
