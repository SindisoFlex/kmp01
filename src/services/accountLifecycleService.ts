import { supabase } from "@/lib/supabase";
import { REACTIVATION_FEE_RAND } from "@/utils/loyaltyUtils";

export const touchLastActivity = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    // Activity touch should not block user navigation.
    console.error("Failed to update last activity timestamp:", error);
  }
};

export const reactivateFrozenAccount = async (paymentReference: string) => {
  const normalizedReference = paymentReference.trim() || `reactivate-${Date.now()}`;

  const { data, error } = await supabase.rpc("reactivate_frozen_account", {
    p_payment_reference: normalizedReference,
    p_fee_paid: REACTIVATION_FEE_RAND
  });

  if (error && error.code !== "42883") {
    throw error;
  }

  if (error?.code === "42883") {
    throw new Error("Account reactivation function is not deployed. Please run the latest Supabase migration.");
  }

  return data;
};
