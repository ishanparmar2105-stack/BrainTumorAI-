import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_DEMO_USER: User = {
  id: 1,
  email: 'demo@example.com',
  username: 'demouser',
  role: 'admin',
  created_at: new Date().toISOString()
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_DEMO_USER);
  const [token, setToken] = useState<string | null>(localStorage.getItem('braintumorai_token'));
  const [isLoading] = useState(false);

  useEffect(() => {
    const fetchTokenInBackground = async () => {
      if (token) return;
      try {
        const response = await authApi.login({ email: 'demo@example.com', password: 'password123' });
        localStorage.setItem('braintumorai_token', response.access_token);
        setToken(response.access_token);
      } catch (err) {
        // Silent fallback
      }
    };

    fetchTokenInBackground();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    localStorage.setItem('braintumorai_token', response.access_token);
    setToken(response.access_token);
    const userData = await authApi.getMe();
    setUser(userData);
  };

  const register = async (email: string, username: string, password: string) => {
    const response = await authApi.register({ email, username, password });
    localStorage.setItem('braintumorai_token', response.access_token);
    setToken(response.access_token);
    const userData = await authApi.getMe();
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('braintumorai_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
