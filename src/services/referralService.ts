import { supabase } from "@/lib/supabase";

export type ReferralStats = {
  total: number;
  pending: number;
  registered: number;
  converted: number;
  earnedTokens: number;
};

type ReferralRow = {
  id: string;
  referrer_id: string;
  referred_email: string | null;
  referred_user_id: string | null;
  status: "pending" | "registered" | "converted";
  reward_tokens: number;
  created_at: string;
};

const toUuidOrNull = (value: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return re.test(trimmed) ? trimmed : null;
};

export const getReferralLinkForUser = (userId: string): string => {
  return `${window.location.origin}/?ref=${encodeURIComponent(userId)}`;
};

export const getReferralStats = async (userId: string): Promise<ReferralStats> => {
  const { data, error } = await supabase
    .from("user_referrals")
    .select("id, referrer_id, referred_email, referred_user_id, status, reward_tokens, created_at")
    .eq("referrer_id", userId);

  if (error) throw error;

  const rows = (data ?? []) as ReferralRow[];

  const pending = rows.filter((r) => r.status === "pending").length;
  const registered = rows.filter((r) => r.status === "registered").length;
  const converted = rows.filter((r) => r.status === "converted").length;
  const earnedTokens = rows.reduce((sum, row) => sum + (Number.isFinite(row.reward_tokens) ? row.reward_tokens : 0), 0);

  return {
    total: rows.length,
    pending,
    registered,
    converted,
    earnedTokens,
  };
};

export const trackReferralOpenFromUrl = async (): Promise<void> => {
  const params = new URLSearchParams(window.location.search);
  const ref = toUuidOrNull(params.get("ref"));
  if (!ref) return;

  localStorage.setItem("pending_referrer_id", ref);

  const { error } = await supabase.rpc("track_referral_open", {
    p_referrer_id: ref,
  });

  if (error) throw error;
};

export const markReferralRegisteredForNewUser = async (referredUserId: string, referredEmail: string): Promise<void> => {
  const referrerId = toUuidOrNull(localStorage.getItem("pending_referrer_id"));
  if (!referrerId) return;
  if (referrerId === referredUserId) {
    localStorage.removeItem("pending_referrer_id");
    return;
  }

  const { error } = await supabase.rpc("mark_referral_registered", {
    p_referrer_id: referrerId,
    p_referred_email: referredEmail || null,
    p_referred_user_id: referredUserId,
  });

  if (error) throw error;
  localStorage.removeItem("pending_referrer_id");
};
