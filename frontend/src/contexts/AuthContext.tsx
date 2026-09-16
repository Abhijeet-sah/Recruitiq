import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: { email: string; password: string; full_name: string; role: UserRole }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('recruitiq_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('recruitiq_token');
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Session expired or invalid:', error);
          localStorage.removeItem('recruitiq_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authApi.login(email, password);
    const token = res?.access_token || (res as any)?.token;
    if (token) {
      localStorage.setItem('recruitiq_token', token);
      setToken(token);
    }

    let userObj: User | null = res?.user || (res as any)?.data?.user || null;
    if (!userObj && token) {
      try {
        userObj = await authApi.getMe();
      } catch (err) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            userObj = {
              id: payload.id || 1,
              email: payload.sub || email,
              full_name: payload.sub ? payload.sub.split('@')[0] : 'User',
              role: (payload.role || 'CANDIDATE') as UserRole,
              is_active: true,
              created_at: new Date().toISOString()
            };
          }
        } catch (jwtErr) {
          console.error('Failed to parse JWT payload', jwtErr);
        }
      }
    }

    if (!userObj) {
      userObj = {
        id: 1,
        email,
        full_name: email.split('@')[0],
        role: 'CANDIDATE',
        is_active: true,
        created_at: new Date().toISOString()
      };
    }

    setUser(userObj);
    return userObj;
  };

  const register = async (payload: { email: string; password: string; full_name: string; role: UserRole }): Promise<User> => {
    const res = await authApi.register(payload);
    const token = res?.access_token || (res as any)?.token;
    if (token) {
      localStorage.setItem('recruitiq_token', token);
      setToken(token);
    }

    let userObj: User | null = res?.user || (res as any)?.data?.user || null;
    if (!userObj && token) {
      try {
        userObj = await authApi.getMe();
      } catch (err) {
        userObj = {
          id: 1,
          email: payload.email,
          full_name: payload.full_name,
          role: payload.role,
          is_active: true,
          created_at: new Date().toISOString()
        };
      }
    }

    if (!userObj) {
      userObj = {
        id: 1,
        email: payload.email,
        full_name: payload.full_name,
        role: payload.role,
        is_active: true,
        created_at: new Date().toISOString()
      };
    }

    setUser(userObj);
    return userObj;
  };

  const logout = () => {
    localStorage.removeItem('recruitiq_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
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
