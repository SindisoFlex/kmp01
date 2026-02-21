export type LoyaltyTrack = "individual" | "corporate";
export type LoyaltyTier = "none" | "bronze" | "silver" | "gold";

export interface LoyaltyState {
  user_id: string;
  individual_tier: LoyaltyTier;
  individual_completed_bookings: number;
  individual_total_spend: number;
  individual_last_activity_at: string | null;
  corporate_tier: LoyaltyTier;
  corporate_eligible_spend: number;
  corporate_last_activity_at: string | null;
  updated_at: string;
}

export interface LoyaltyEvent {
  id: string;
  user_id: string;
  track: LoyaltyTrack;
  event_type: "BOOKING_COMPLETED" | "TIER_UP" | "RESET_INACTIVITY" | "ADMIN_ADJUST";
  delta_bookings: number | null;
  delta_spend: number | null;
  prev_tier: LoyaltyTier | null;
  new_tier: LoyaltyTier | null;
  context: Record<string, unknown>;
  created_at: string;
}

export interface LoyaltyTierConfig {
  track: LoyaltyTrack;
  tier: LoyaltyTier;
  minimum_bookings?: number | null;
  minimum_spend?: number | null;
  benefits: string[];
}
