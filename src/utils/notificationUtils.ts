
import { toast } from "@/components/ui/sonner";

// Types for our notification system
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type UserAction = 'booking' | 'payment' | 'gallery_view' | 'login' | 'membership_change' | 'page_visit';

interface NotificationConfig {
  title: string;
  description: string;
  type: NotificationType;
  duration?: number; // in milliseconds
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Behavior-based notification templates
const notificationTemplates: Record<string, NotificationConfig> = {
  // Session reminders
  upcoming_session: {
    title: "Upcoming Photo Session",
    description: "You have a photo session scheduled for tomorrow. Don't forget to prepare!",
    type: "info",
    duration: 10000,
  },
  
  // Membership related
  tier_upgrade_suggestion: {
    title: "Upgrade Your Membership",
    description: "You're just 10 points away from Silver tier! Book a mini session to upgrade.",
    type: "info",
  },
  
  // Gallery related
  gallery_expiring: {
    title: "Gallery Expiring Soon",
    description: "Your gallery access will expire in 7 days. Consider extending your access.",
    type: "warning",
  },
  
  // Payment reminders
  payment_pending: {
    title: "Payment Pending",
    description: "You have a pending payment for your recent booking.",
    type: "warning",
  },
  
  // Special offers
  special_offer: {
    title: "Special Offer Just For You",
    description: "Enjoy 15% off on your next booking as a loyal customer!",
    type: "success",
  },
  
  // Referral rewards
  referral_success: {
    title: "Referral Bonus!",
    description: "Your friend just signed up. You've earned 10 loyalty points!",
    type: "success",
  },
  
  // Inactivity reminders
  inactivity_reminder: {
    title: "We Miss You!",
    description: "It's been a while since your last session. Book now and get bonus points!",
    type: "info",
  },
};

// Analytics tracking for user behavior
export const trackUserBehavior = (userId: string, action: UserAction, metadata?: Record<string, any>) => {
  // In a real application, this would send analytics data to a backend service
  console.log(`[Analytics] User ${userId} performed ${action}`, metadata);
  
  // Return this for testing purposes
  return {
    userId,
    action,
    timestamp: new Date().toISOString(),
    metadata,
  };
};

// Show behavior-based notifications
export const showBehaviorNotification = (
  notificationType: keyof typeof notificationTemplates,
  customData?: Partial<NotificationConfig>
) => {
  const template = notificationTemplates[notificationType];
  
  if (!template) return;
  
  const notification = {
    ...template,
    ...customData,
  };
  
  // Show the toast notification
  toast(notification.title, {
    description: notification.description,
    duration: notification.duration || 5000,
    action: notification.action ? {
      label: notification.action.label,
      onClick: notification.action.onClick,
    } : undefined,
  });
  
  return notification;
};

// Generate smart prompts based on user behavior
export const generateSmartPrompts = (userData: {
  lastLogin?: Date;
  membershipTier: string;
  points: number;
  upcomingSessions: number;
  galleryViews: number;
  pendingPayments: boolean;
}): string[] => {
  const prompts: string[] = [];
  
  // Membership tier prompts
  if (userData.membershipTier === 'free') {
    prompts.push("Upgrade to Bronze tier and enjoy 5% off on your next session!");
  } else if (userData.membershipTier === 'bronze' && userData.points > 40) {
    prompts.push("You're close to Silver tier! Just a few more points to unlock more benefits.");
  }
  
  // Upcoming session prompts
  if (userData.upcomingSessions > 0) {
    prompts.push("You have upcoming sessions. Need help preparing?");
  }
  
  // Payment prompts
  if (userData.pendingPayments) {
    prompts.push("You have pending payments. Would you like to complete them now?");
  }
  
  // Gallery prompts
  if (userData.galleryViews > 5 && userData.membershipTier !== 'vip') {
    prompts.push("Loving your gallery? VIP members get lifetime access to all photos!");
  }
  
  // Add some variety
  prompts.push("Looking for photography tips? Ask our AI assistant!");
  prompts.push("Have you checked our latest portfolio updates?");
  
  return prompts;
};

// Personalized notification system
export const getPersonalizedNotifications = (userId: string) => {
  // In a real app, this would fetch from a backend
  // For now we'll just return some dummy data
  return [
    {
      id: "1",
      type: "info",
      read: false,
      title: "Welcome Back!",
      description: "It's been 2 weeks since your last visit. Check out our new features!",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: "2",
      type: "success",
      read: true,
      title: "Points Added",
      description: "You've earned 5 loyalty points from your recent portrait session.",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      id: "3",
      type: "warning",
      read: false,
      title: "Gallery Expiring",
      description: "Your wedding photos gallery access will expire in 7 days.",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    },
  ];
};
