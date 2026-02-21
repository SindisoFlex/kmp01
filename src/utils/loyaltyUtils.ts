
export type MembershipTier = 'free' | 'bronze' | 'silver' | 'gold' | 'vip';

export interface LoyaltyConfig {
    tiers: {
        [key in MembershipTier]: {
            min: number;
            max: number;
            color: string;
            perks: string[];
            discount: number;
        }
    };
    staffDiscountPercent: number;
    staffDiscountEligibleCategories: string[];
    vatRate: number;
}

export const loyaltyConfig: LoyaltyConfig = {
    staffDiscountPercent: 15,
    staffDiscountEligibleCategories: ['Photography', 'Videography', 'Printing'],
    vatRate: 0.15,
    tiers: {
        free: {
            min: 0,
            max: 14,
            color: 'gray-400',
            discount: 0,
            perks: [
                'Basic account access',
                'Online booking',
                'View and download photos'
            ]
        },
        bronze: {
            min: 1, // 1st completed booking
            max: 2,
            color: 'amber-600',
            discount: 5,
            perks: [
                'Welcome bonus credited',
                '5% service discount',
                '1 free print'
            ]
        },
        silver: {
            min: 3,
            max: 4,
            color: 'gray-400',
            discount: 10,
            perks: [
                'All bronze benefits',
                '10% service discount',
                '6-month gallery access'
            ]
        },
        gold: {
            min: 5,
            max: 9,
            color: 'yellow-500',
            discount: 15,
            perks: [
                'All silver benefits',
                '15% service discount',
                '12-month gallery access'
            ]
        },
        vip: {
            min: 10,
            max: Infinity,
            color: 'purple-600',
            discount: 20,
            perks: [
                'All gold benefits',
                '20% service discount',
                'Lifetime gallery access'
            ]
        }
    }
};

export const REACTIVATION_FEE_RAND = 300;

export function determineTier(bookingsCount: number): MembershipTier {
    if (bookingsCount >= 10) return 'vip';
    if (bookingsCount >= 5) return 'gold';
    if (bookingsCount >= 3) return 'silver';
    if (bookingsCount >= 1) return 'bronze';
    return 'free';
}

/**
 * Applies staff discount (15% on specific categories)
 */
export function calculateStaffDiscount(bookingTotal: number, category: string): number {
    if (loyaltyConfig.staffDiscountEligibleCategories.includes(category)) {
        return (bookingTotal * loyaltyConfig.staffDiscountPercent) / 100;
    }
    return 0;
}

// Calculate discount and VAT based on membership tier
export function calculatePricing(basePrice: number, membershipTier: MembershipTier, isStaff: boolean = false, category: string = ''): {
    subtotal: number;
    tierDiscountAmount: number;
    staffDiscountAmount: number;
    amountBeforeVat: number;
    vatAmount: number;
    totalAmount: number;
} {
    const tierConfig = loyaltyConfig.tiers[membershipTier] || loyaltyConfig.tiers.free;
    const tierDiscountAmount = (basePrice * tierConfig.discount) / 100;

    let staffDiscountAmount = 0;
    if (isStaff) {
        staffDiscountAmount = calculateStaffDiscount(basePrice, category);
    }

    const amountBeforeVat = Math.max(0, basePrice - tierDiscountAmount - staffDiscountAmount);
    const vatAmount = amountBeforeVat * loyaltyConfig.vatRate;
    const totalAmount = amountBeforeVat + vatAmount;

    return {
        subtotal: basePrice,
        tierDiscountAmount,
        staffDiscountAmount,
        amountBeforeVat,
        vatAmount,
        totalAmount
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
            return 36500; // ~100 years
        default:
            return 30; // 30 days for free tier
    }
}
