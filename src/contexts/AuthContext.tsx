
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '../types/auth';
import {
  loginUser,
  loginStaff,
  loginAdmin,
  registerUser,
  socialLoginUser,
  createGuestAccess
} from '../services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  // Regular client login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const mockUser = await loginUser(email, password);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Staff login
  const staffLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const mockUser = await loginStaff(email, password);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Staff login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Admin login
  const adminLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const mockUser = await loginAdmin(email, password);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // User registration
  const register = async (name: string, email: string, password: string, allowMarketing = false) => {
    setLoading(true);
    try {
      const mockUser = await registerUser(name, email, password, allowMarketing);
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

  // Social login
  const socialLogin = async (provider: 'google' | 'facebook' | 'whatsapp') => {
    setLoading(true);
    try {
      const mockUser = await socialLoginUser(provider);
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

  // Guest access
  const guestAccess = async (name: string, email: string) => {
    setLoading(true);
    try {
      const mockUser = await createGuestAccess(name, email);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Guest access error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Helper function to check if user has specific role(s)
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  };

  // Update membership tier
  const updateMembershipTier = (tier: 'free' | 'bronze' | 'silver' | 'gold' | 'vip') => {
    if (user) {
      const updatedUser = { ...user, membershipTier: tier };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  // Add loyalty points
  const addPoints = (points: number) => {
    if (user) {
      const updatedUser = { ...user, points: user.points + points };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
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
        staffLogin,
        adminLogin,
        guestAccess,
        logout,
        hasRole,
        updateMembershipTier,
        addPoints
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
