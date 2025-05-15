
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  membershipTier: 'free' | 'basic' | 'premium' | 'vip';
  points: number;
  profilePic?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, allowMarketing?: boolean) => Promise<void>;
  socialLogin: (provider: 'google' | 'facebook' | 'whatsapp') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Mock login function - in a real app, this would communicate with a backend
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'demo@example.com' && password === 'password') {
        const mockUser: User = {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          membershipTier: 'basic',
          points: 150,
          profilePic: 'https://i.pravatar.cc/150?u=demo'
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock registration function
  const register = async (name: string, email: string, password: string, allowMarketing = false) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: Date.now().toString(),
        name,
        email,
        membershipTier: 'free',
        points: 50, // Welcome points
        profilePic: undefined
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock social login
  const socialLogin = async (provider: 'google' | 'facebook' | 'whatsapp') => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: Date.now().toString(),
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        email: `user@${provider}.com`,
        membershipTier: 'free',
        points: 50,
        profilePic: `https://i.pravatar.cc/150?u=${provider}${Date.now()}`
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(`${provider} login error:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        socialLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
