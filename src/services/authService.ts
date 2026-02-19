
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types/auth';

/**
 * Maps a Supabase profile record to the application's User type.
 */
const mapProfileToUser = (profile: any): User => {
  return {
    id: profile.id,
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone,
    membershipTier: profile.membership_tier || 'free',
    points: profile.points || 0,
    profilePic: profile.avatar,
    role: (profile.role?.toLowerCase() as UserRole) || 'client',
  };
};

/**
 * Fetches a user profile from the database.
 */
export const getUserProfile = async (userId: string): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }

  return mapProfileToUser(data);
};

// Login function for regular clients
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error);
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Your email is not confirmed yet. Please check your inbox for the confirmation link.');
      }
      throw error;
    }

    if (!data.user) throw new Error('No user data returned from login');

    return await getUserProfile(data.user.id);
  } catch (error) {
    console.error('Login service error:', error);
    throw error;
  }
};

// Staff login function (can use the same auth, but we can verify role)
export const loginStaff = async (email: string, password: string): Promise<User> => {
  const user = await loginUser(email, password);
  if (user.role !== 'staff' && user.role !== 'admin') {
    throw new Error('Unauthorized: Staff access only');
  }
  return user;
};

// Admin login function
export const loginAdmin = async (email: string, password: string): Promise<User> => {
  const user = await loginUser(email, password);
  if (user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access only');
  }
  return user;
};

// Registration function
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  allowMarketing = false
): Promise<User | { needsConfirmation: true }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          allow_marketing: allowMarketing,
          role: 'CLIENT', // Explicitly set role for the trigger
        },
      },
    });

    if (error) {
      console.error('Supabase registration error:', error);
      throw error;
    }

    if (!data.user) throw new Error('Registration failed: No user returned');

    // If email confirmation is enabled, the session will be null
    if (!data.session) {
      console.log('Registration successful, waiting for email confirmation');
      return { needsConfirmation: true };
    }

    // Attempt to fetch profile with retries
    let profile;
    let attempts = 0;
    while (!profile && attempts < 10) { // Increased attempts
      try {
        profile = await getUserProfile(data.user.id);
      } catch (e) {
        await new Promise(r => setTimeout(r, 800)); // Longer wait
        attempts++;
      }
    }

    if (!profile) {
      console.warn('Profile creation taking longer than expected');
      // Return a basic user object if profile fetch fails after retries
      return {
        id: data.user.id,
        name: name,
        email: email,
        membershipTier: 'free',
        points: 0,
        role: 'client'
      };
    }

    return profile;
  } catch (error) {
    console.error('Registration service error:', error);
    throw error;
  }
};

// Social login
export const socialLoginUser = async (provider: 'google' | 'facebook' | 'whatsapp'): Promise<void> => {
  try {
    if (provider === 'whatsapp') {
      throw new Error('WhatsApp login is currently disabled. Please use Google or Facebook.');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: window.location.origin + '/dashboard',
      }
    });

    if (error) {
      if (error.message.includes('provider is not enabled')) {
        throw new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not enabled in backend settings.`);
      }
      throw error;
    }
  } catch (error) {
    console.error('Social login service error:', error);
    throw error;
  }
};

// Guest access function (typically just creates a placeholder or local state)
export const createGuestAccess = async (name: string, email: string): Promise<User> => {
  // For guests, we might not want to create an actual auth user, 
  // or we could use anonymous sign-ins if enabled in Supabase.
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

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
