import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentStoredUser());
  const [token, setToken] = useState(authService.getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authService.getToken();
      if (storedToken) {
        try {
          const me = await authService.getMe();
          setUser(me);
          localStorage.setItem('user', JSON.stringify(me));
        } catch (err) {
          console.error('Failed to verify token', err);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth_logout', handleLogout);
    return () => window.removeEventListener('auth_logout', handleLogout);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const socialLogin = async (socialData) => {
    if (socialData && socialData.token && socialData.user) {
      setUser(socialData.user);
      setToken(socialData.token);
      return socialData;
    }
    const data = await authService.socialLogin(socialData);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (profileData) => {
    const updated = await authService.updateProfile(profileData);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        socialLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
