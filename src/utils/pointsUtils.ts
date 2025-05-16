
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
      perks: ['Basic account access']
    },
    bronze: {
      min: 1,
      max: 50,
      color: 'amber-600',
      perks: ['5% discount on photoshoots', 'Access to basic filters']
    },
    silver: {
      min: 51,
      max: 100,
      color: 'gray-400',
      perks: ['10% discount on photoshoots', 'Access to premium filters', 'Priority booking']
    },
    gold: {
      min: 101,
      max: 250,
      color: 'yellow-500',
      perks: ['15% discount on photoshoots', 'Access to all filters', 'Priority booking', 'Free photo editing']
    },
    vip: {
      min: 251,
      max: Infinity,
      color: 'purple-600',
      perks: ['20% discount on photoshoots', 'Access to all features', 'Priority booking', 'Free photo editing', 'Annual free photoshoot']
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
