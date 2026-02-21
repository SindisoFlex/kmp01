
import type { LoyaltyState } from "./loyalty";

export type UserRole = 'client' | 'staff' | 'admin' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  bio?: string;
  isBusinessAccount?: boolean;
  membershipTier: 'free' | 'bronze' | 'silver' | 'gold' | 'vip';
  profilePic?: string;
  role: UserRole;
  signupMethod?: 'email' | 'google' | 'facebook' | 'whatsapp';
  accountStatus: 'active' | 'frozen' | 'suspended';
  lastActivityAt?: string;
  loyaltyState?: LoyaltyState;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, allowMarketing?: boolean) => Promise<{ needsConfirmation: boolean } | void>;
  socialLogin: (provider: 'google' | 'facebook' | 'whatsapp') => Promise<void>;
  staffLogin: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  guestAccess: (name: string, email: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  updateMembershipTier: (tier: 'free' | 'bronze' | 'silver' | 'gold' | 'vip') => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
