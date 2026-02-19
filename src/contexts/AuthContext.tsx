
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '../types/auth';
import { supabase } from '../lib/supabase';
import {
  loginUser,
  loginStaff,
  loginAdmin as loginAdminService,
  registerUser,
  socialLoginUser,
  createGuestAccess,
  getUserProfile,
  logoutUser
} from '../services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync auth state with Supabase
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
          setUser(profile);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Initial session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      if (session?.user) {
        try {
          const profile = await getUserProfile(session.user.id);
          setUser(profile);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('State change profile fetch error:', error);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Regular client login
  const login = async (email: string, password: string) => {
    await loginUser(email, password);
    // State will be updated by onAuthStateChange
  };

  // Staff login
  const staffLogin = async (email: string, password: string) => {
    await loginStaff(email, password);
    // State will be updated by onAuthStateChange
  };

  // Admin login
  const adminLogin = async (email: string, password: string) => {
    await loginAdminService(email, password);
    // State will be updated by onAuthStateChange
  };

  // User registration
  const register = async (name: string, email: string, password: string, allowMarketing = false) => {
    const result = await registerUser(name, email, password, allowMarketing);
    if (result && 'needsConfirmation' in result) {
      return { needsConfirmation: true };
    }
  };

  // Social login
  const socialLogin = async (provider: 'google' | 'facebook' | 'whatsapp') => {
    await socialLoginUser(provider);
    // Redirects automatically
  };

  // Guest access (stays local/mock for now)
  const guestAccess = async (name: string, email: string) => {
    setLoading(true);
    try {
      const guestUser = await createGuestAccess(name, email);
      setUser(guestUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Guest access error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if user has specific role(s)
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  };

  // Update membership tier (local optimization, should ideally update DB)
  const updateMembershipTier = (tier: 'free' | 'bronze' | 'silver' | 'gold' | 'vip') => {
    if (user) {
      setUser({ ...user, membershipTier: tier });
      // In production, sync this to Supabase 'profiles' table
    }
  };

  // Add loyalty points (local optimization, should ideally update DB)
  const addPoints = (points: number) => {
    if (user) {
      setUser({ ...user, points: user.points + points });
      // In production, sync this to Supabase 'profiles' table
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
