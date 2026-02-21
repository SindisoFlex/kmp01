import { supabase } from "@/lib/supabase";
import { LoyaltyEvent, LoyaltyState, LoyaltyTier, LoyaltyTierConfig, LoyaltyTrack } from "@/types/loyalty";

const FALLBACK_BENEFITS: LoyaltyTierConfig[] = [
  {
    track: "individual",
    tier: "none",
    minimum_bookings: 0,
    minimum_spend: 0,
    benefits: ["Access to online booking", "Progress tracking toward Bronze"],
  },
  {
    track: "individual",
    tier: "bronze",
    minimum_bookings: 1,
    minimum_spend: 0,
    benefits: ["5% service discount", "Member-only offers", "Priority support queue"],
  },
  {
    track: "individual",
    tier: "silver",
    minimum_bookings: 3,
    minimum_spend: 0,
    benefits: ["10% service discount", "Priority booking slots", "Exclusive package offers"],
  },
  {
    track: "individual",
    tier: "gold",
    minimum_bookings: 5,
    minimum_spend: 0,
    benefits: ["15% service discount", "Top-priority booking", "VIP exclusive services"],
  },
  {
    track: "corporate",
    tier: "none",
    minimum_bookings: 0,
    minimum_spend: 0,
    benefits: ["Spend toward Bronze on Web Development and Marketing"],
  },
  {
    track: "corporate",
    tier: "bronze",
    minimum_bookings: null,
    minimum_spend: 50000,
    benefits: ["Priority project queue", "Quarterly optimization review"],
  },
  {
    track: "corporate",
    tier: "silver",
    minimum_bookings: null,
    minimum_spend: 100000,
    benefits: ["Faster turnaround windows", "Bespoke growth planning"],
  },
  {
    track: "corporate",
    tier: "gold",
    minimum_bookings: null,
    minimum_spend: 200000,
    benefits: ["Dedicated account manager", "Highest-priority delivery lane"],
  },
];

export const getLoyaltyState = async (userId: string): Promise<LoyaltyState | null> => {
  const { data, error } = await supabase
    .from("loyalty_state")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as LoyaltyState | null;
};

export const getLoyaltyEvents = async (userId: string, track?: LoyaltyTrack): Promise<LoyaltyEvent[]> => {
  let query = supabase
    .from("loyalty_events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (track) {
    query = query.eq("track", track);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as LoyaltyEvent[];
};

export const getLoyaltyBenefits = async (track: LoyaltyTrack, tier: LoyaltyTier): Promise<string[]> => {
  const { data, error } = await supabase
    .from("loyalty_tier_config")
    .select("benefits")
    .eq("track", track)
    .eq("tier", tier)
    .maybeSingle();

  if (!error && data?.benefits) {
    return data.benefits as string[];
  }

  const fallback = FALLBACK_BENEFITS.find((row) => row.track === track && row.tier === tier);
  return fallback?.benefits || [];
};

export const refreshLoyaltyAfterCompletion = async (bookingId: string) => {
  const { error } = await supabase.rpc("apply_completed_booking_to_loyalty", {
    p_booking_id: bookingId,
  });

  if (error) {
    throw error;
  }

  return { applied: true };
};

export const getCorporateTierThresholds = () => ({
  bronze: 50000,
  silver: 100000,
  gold: 200000,
});

export const getIndividualTierThresholds = () => ({
  bronze: 1,
  silver: 3,
  gold: 5,
});
