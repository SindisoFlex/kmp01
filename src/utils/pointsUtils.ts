
export type MembershipTier = 'free' | 'bronze' | 'silver' | 'gold' | 'vip';

export interface PointsConfig {
  tiers: {
    [key: string]: {
      min: number;
      max: number;
      color: string;
      perks: string[];
    }
  };
  conversionRate: number; // R5 = 1 point
}

export const pointsConfig: PointsConfig = {
  conversionRate: 5, // R5 = 1 point
  tiers: {
    free: {
      min: 0,
      max: 0,
      color: 'gray-400',
      perks: [
        'Basic account access',
        'Online booking',
        'View and download photos',
        '30-day gallery access'
      ]
    },
    bronze: {
      min: 1,
      max: 50,
      color: 'amber-600',
      perks: [
        'All free benefits',
        '5% discount on photoshoots',
        'Access to basic filters',
        '3-month gallery access',
        '1 free print'
      ]
    },
    silver: {
      min: 51,
      max: 100,
      color: 'gray-400',
      perks: [
        'All bronze benefits',
        '10% discount on photoshoots',
        'Access to premium filters',
        'Priority booking',
        '6-month gallery access',
        'Extra downloads',
        'Bonus points on referrals'
      ]
    },
    gold: {
      min: 101,
      max: 250,
      color: 'yellow-500',
      perks: [
        'All silver benefits',
        '15% discount on photoshoots',
        'Access to all filters',
        'Priority booking',
        'Free photo editing',
        '12-month gallery access',
        'Free add-ons',
        'Personalized gallery themes'
      ]
    },
    vip: {
      min: 251,
      max: Infinity,
      color: 'purple-600',
      perks: [
        'All gold benefits',
        '20% discount on photoshoots',
        'Access to all features',
        'VIP priority booking',
        'Free photo editing',
        'Annual free photoshoot',
        'Lifetime gallery access',
        'Exclusive VIP events'
      ]
    }
  }
};

export function calculatePointsFromSpend(amountInRand: number): number {
  return Math.floor(amountInRand / pointsConfig.conversionRate);
}

export function determineTier(points: number): MembershipTier {
  if (points >= pointsConfig.tiers.vip.min) return 'vip';
  if (points >= pointsConfig.tiers.gold.min) return 'gold';
  if (points >= pointsConfig.tiers.silver.min) return 'silver';
  if (points >= pointsConfig.tiers.bronze.min) return 'bronze';
  return 'free';
}

export function getNextTier(currentTier: MembershipTier): MembershipTier | null {
  const tiers: MembershipTier[] = ['free', 'bronze', 'silver', 'gold', 'vip'];
  const currentIndex = tiers.indexOf(currentTier);
  
  if (currentIndex === tiers.length - 1) return null; // Already at highest tier
  return tiers[currentIndex + 1];
}

export function pointsToNextTier(currentPoints: number): { nextTier: MembershipTier | null, pointsNeeded: number } {
  const currentTier = determineTier(currentPoints);
  const nextTier = getNextTier(currentTier);
  
  if (!nextTier) {
    return { nextTier: null, pointsNeeded: 0 };
  }
  
  const pointsNeeded = pointsConfig.tiers[nextTier].min - currentPoints;
  return { nextTier, pointsNeeded };
}

// Calculate discount based on membership tier
export function calculateDiscount(basePrice: number, membershipTier: MembershipTier): {
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
} {
  let discountPercent = 0;
  
  switch (membershipTier) {
    case 'bronze':
      discountPercent = 5;
      break;
    case 'silver':
      discountPercent = 10;
      break;
    case 'gold':
      discountPercent = 15;
      break;
    case 'vip':
      discountPercent = 20;
      break;
    default:
      discountPercent = 0;
  }
  
  const discountAmount = (basePrice * discountPercent) / 100;
  const finalPrice = basePrice - discountAmount;
  
  return {
    discountPercent,
    discountAmount,
    finalPrice
  };
}

// Get gallery access duration in days based on membership tier
export function getGalleryAccessDuration(membershipTier: MembershipTier): number {
  switch (membershipTier) {
    case 'bronze':
      return 90; // 3 months
    case 'silver':
      return 180; // 6 months
    case 'gold':
      return 365; // 12 months
    case 'vip':
      return 36500; // ~100 years (essentially lifetime)
    default:
      return 30; // 30 days for free tier
  }
}

// Function to track points for different activities
export function calculatePointsForActivity(activityType: string, value?: number): number {
  switch (activityType) {
    case 'booking':
      // Points from booking are calculated from spend
      return value ? calculatePointsFromSpend(value) : 0;
      
    case 'referral':
      // Fixed points for successful referral
      return 20;
      
    case 'review':
      // Points for leaving a review
      return 5;
      
    case 'testimonial':
      // Points for submitting a testimonial
      return 10;
      
    case 'share_gallery':
      // Points for sharing gallery on social media
      return 3;
      
    case 'complete_profile':
      // Points for completing profile
      return 2;
      
    default:
      return 0;
  }
}
