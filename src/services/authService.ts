import { supabase } from "../lib/supabase";
import { User, UserRole } from "../types/auth";
import { determineTier } from "../utils/loyaltyUtils";

const mapProfileToUser = (profile: any): User => {
  const rawAccountStatus = String(profile.account_status || "active").toLowerCase();
  const accountStatus = rawAccountStatus === "inactive" ? "frozen" : rawAccountStatus;

  return {
    id: profile.id,
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    bio: profile.bio,
    isBusinessAccount: Boolean(profile.is_business_account),
    membershipTier: profile.membership_tier || determineTier(profile.individual_completed_bookings || 0),
    profilePic: profile.avatar,
    role: (profile.role?.toLowerCase() as UserRole) || "client",
    accountStatus: (accountStatus as User["accountStatus"]) || "active",
    lastActivityAt: profile.last_activity_at,
  };
};

export const getUserProfile = async (userId: string): Promise<User> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Not found error code for .single()
      console.log('Profile not found, creating one for user:', userId);
      const { data: { user: authUser } } = await supabase.auth.getUser();

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: authUser?.email || '',
          name: authUser?.user_metadata?.name || '',
          account_status: 'active',
          last_activity_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating missing profile:', createError);
        throw createError;
      }
      return mapProfileToUser(newProfile);
    }
    console.error("Error fetching profile:", error);
    throw error;
  }

  return mapProfileToUser(data);
};

export const resetPassword = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Supabase login error:", error);
    if (error.message.includes("Email not confirmed")) {
      throw new Error("Your email is not confirmed yet. Please check your inbox for the confirmation link.");
    }
    throw error;
  }

  if (!data.user) {
    throw new Error("No user data returned from login.");
  }

  return getUserProfile(data.user.id);
};

export const loginStaff = async (email: string, password: string): Promise<User> => {
  const user = await loginUser(email, password);
  if (user.role !== "staff" && user.role !== "admin") {
    throw new Error("Unauthorized: Staff access only");
  }
  return user;
};

export const loginAdmin = async (email: string, password: string): Promise<User> => {
  const user = await loginUser(email, password);
  if (user.role !== "admin") {
    throw new Error("Unauthorized: Admin access only");
  }
  return user;
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  allowMarketing = false
): Promise<User | { needsConfirmation: true }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        allow_marketing: allowMarketing,
        role: "CLIENT",
      },
    },
  });

  if (error) {
    console.error("Supabase registration error:", error);
    throw error;
  }

  if (!data.user) {
    throw new Error("Registration failed: No user returned.");
  }

  if (!data.session) {
    return { needsConfirmation: true };
  }

  let profile: User | null = null;
  let attempts = 0;
  while (!profile && attempts < 10) {
    try {
      profile = await getUserProfile(data.user.id);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 800));
      attempts += 1;
    }
  }

  if (!profile) {
    return {
      id: data.user.id,
      name,
      email,
      isBusinessAccount: false,
      membershipTier: "free",
      role: "client",
      accountStatus: "active",
      lastActivityAt: new Date().toISOString(),
    };
  }

  return profile;
};

export const socialLoginUser = async (provider: "google" | "facebook" | "whatsapp"): Promise<void> => {
  if (provider === "whatsapp") {
    throw new Error("WhatsApp login is currently disabled. Please use Google or Facebook.");
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) {
    if (error.message.includes("provider is not enabled")) {
      throw new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not enabled in backend settings.`);
    }
    throw error;
  }
};

export const createGuestAccess = async (name: string, email: string): Promise<User> => {
  return {
    id: `guest-${Date.now()}`,
    name,
    email,
    isBusinessAccount: false,
    membershipTier: "free",
    role: "guest",
    accountStatus: "active",
  };
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
  const dbData: any = {};
  if (data.name !== undefined) dbData.name = data.name;
  if (data.phone !== undefined) dbData.phone = data.phone;
  if (data.whatsapp !== undefined) dbData.whatsapp = data.whatsapp;
  if (data.bio !== undefined) dbData.bio = data.bio;
  if (data.isBusinessAccount !== undefined) dbData.is_business_account = data.isBusinessAccount;
  if (data.profilePic !== undefined) dbData.avatar = data.profilePic;

  const { error } = await supabase
    .from("profiles")
    .update(dbData)
    .eq("id", userId);

  if (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
