
import { User } from '../types/auth';

// Mock login function for regular clients
export const loginUser = async (email: string, password: string): Promise<User> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (email === 'demo@example.com' && password === 'password') {
    const mockUser: User = {
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      membershipTier: 'bronze', // Changed from 'basic'
      points: 150,
      profilePic: 'https://i.pravatar.cc/150?u=demo',
      role: 'client',
      signupMethod: 'email'
    };
    
    return mockUser;
  } else {
    throw new Error('Invalid credentials');
  }
};

// Mock staff login function
export const loginStaff = async (email: string, password: string): Promise<User> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (email === 'staff@example.com' && password === 'staffpass') {
    const mockUser: User = {
      id: 'staff1',
      name: 'Staff Member',
      email: 'staff@example.com',
      membershipTier: 'gold', // Changed from 'premium'
      points: 0, // Not applicable for staff
      profilePic: 'https://i.pravatar.cc/150?u=staff',
      role: 'staff'
    };
    
    return mockUser;
  }
  
  throw new Error('Invalid staff credentials');
};

// Mock admin login function
export const loginAdmin = async (email: string, password: string): Promise<User> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (email === 'admin@example.com' && password === 'adminpass') {
    const mockUser: User = {
      id: 'admin1',
      name: 'Admin User',
      email: 'admin@example.com',
      membershipTier: 'vip', // Not really applicable for admin
      points: 0, // Not applicable for admin
      profilePic: 'https://i.pravatar.cc/150?u=admin',
      role: 'admin'
    };
    
    return mockUser;
  }
  
  throw new Error('Invalid admin credentials');
};

// Mock registration function
export const registerUser = async (
  name: string, 
  email: string, 
  password: string, 
  allowMarketing = false
): Promise<User> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockUser: User = {
    id: Date.now().toString(),
    name,
    email,
    membershipTier: 'free',
    points: 50, // Welcome points
    profilePic: undefined,
    role: 'client',
    signupMethod: 'email'
  };
  
  return mockUser;
};

// Mock social login
export const socialLoginUser = async (provider: 'google' | 'facebook' | 'whatsapp'): Promise<User> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockUser: User = {
    id: Date.now().toString(),
    name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
    email: `user@${provider}.com`,
    membershipTier: 'free',
    points: 50,
    profilePic: `https://i.pravatar.cc/150?u=${provider}${Date.now()}`,
    role: 'client',
    signupMethod: provider
  };
  
  return mockUser;
};

// Guest access function (for quote requests)
export const createGuestAccess = async (name: string, email: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockUser: User = {
    id: `guest-${Date.now()}`,
    name,
    email,
    membershipTier: 'free',
    points: 0,
    role: 'guest'
  };
  
  return mockUser;
};
