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

const decodeJwtPayload = (jwtToken: string): any => {
  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const decoded = decodeURIComponent(
      Array.prototype.map
        .call(atob(base64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(decoded);
  } catch (_) {
    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3) return null;
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4 !== 0) {
        base64 += '=';
      }
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('recruitiq_token'));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('recruitiq_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      const savedToken = localStorage.getItem('recruitiq_token');
      if (savedToken) {
        const payload = decodeJwtPayload(savedToken);
        if (payload) {
          return {
            id: payload.id || 1,
            email: payload.sub || '',
            full_name: payload.sub ? payload.sub.split('@')[0] : 'User',
            role: (payload.role || 'CANDIDATE') as UserRole,
            is_active: true,
            created_at: new Date().toISOString()
          };
        }
      }
    } catch (_) {}
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const syncSession = async () => {
      const storedToken = localStorage.getItem('recruitiq_token');
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          if (userData && userData.role) {
            setUser(userData);
            localStorage.setItem('recruitiq_user', JSON.stringify(userData));
          }
        } catch (error) {
          console.warn('Background session sync:', error);
        }
      }
    };

    syncSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authApi.login(email, password);
    const tokenStr = res?.access_token || (res as any)?.token;
    if (tokenStr) {
      localStorage.setItem('recruitiq_token', tokenStr);
      setToken(tokenStr);
    }

    let userObj: User | null = res?.user || (res as any)?.data?.user || null;
    if (!userObj && tokenStr) {
      const payload = decodeJwtPayload(tokenStr);
      if (payload) {
        userObj = {
          id: payload.id || 1,
          email: payload.sub || email,
          full_name: payload.sub ? payload.sub.split('@')[0] : 'User',
          role: (payload.role || 'CANDIDATE') as UserRole,
          is_active: true,
          created_at: new Date().toISOString()
        };
      }
      try {
        const fetched = await authApi.getMe();
        if (fetched) userObj = fetched;
      } catch (_) {}
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

    localStorage.setItem('recruitiq_user', JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const register = async (payload: { email: string; password: string; full_name: string; role: UserRole }): Promise<User> => {
    const res = await authApi.register(payload);
    const tokenStr = res?.access_token || (res as any)?.token;
    if (tokenStr) {
      localStorage.setItem('recruitiq_token', tokenStr);
      setToken(tokenStr);
    }

    let userObj: User | null = res?.user || (res as any)?.data?.user || null;
    if (!userObj && tokenStr) {
      const jwtPayload = decodeJwtPayload(tokenStr);
      if (jwtPayload && jwtPayload.role) {
        userObj = {
          id: jwtPayload.id || 1,
          email: payload.email,
          full_name: payload.full_name,
          role: (jwtPayload.role || payload.role) as UserRole,
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

    localStorage.setItem('recruitiq_user', JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const logout = () => {
    localStorage.removeItem('recruitiq_token');
    localStorage.removeItem('recruitiq_user');
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
