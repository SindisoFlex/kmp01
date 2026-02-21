import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────
export interface TokenBalance {
    user_id: string;
    balance: number;
    lifetime_earned: number;
    updated_at: string;
}

export interface TokenTransaction {
    id: string;
    user_id: string;
    booking_id: string | null;
    amount: number;
    type: "earn" | "spend" | "bonus" | "adjustment";
    description: string;
    created_at: string;
}

// ── Queries ───────────────────────────────────────────────────────

export const getTokenBalance = async (userId: string): Promise<TokenBalance | null> => {
    const { data, error } = await supabase
        .from("user_tokens")
        .select("user_id, balance, lifetime_earned, updated_at")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    return {
        user_id: data.user_id,
        balance: Number(data.balance) || 0,
        lifetime_earned: Number(data.lifetime_earned) || 0,
        updated_at: data.updated_at,
    };
};

export const getTokenHistory = async (userId: string): Promise<TokenTransaction[]> => {
    const { data, error } = await supabase
        .from("token_transactions")
        .select("id, user_id, booking_id, amount, type, description, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) throw error;

    return (data ?? []).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        booking_id: row.booking_id ?? null,
        amount: Number(row.amount) || 0,
        type: row.type as TokenTransaction["type"],
        description: row.description ?? "",
        created_at: row.created_at,
    }));
};

// ── Mutations ─────────────────────────────────────────────────────

export const claimFirstLoginBonus = async (): Promise<number> => {
    const { data, error } = await supabase.rpc("credit_first_login_bonus");

    if (error) throw error;
    return Number(data) || 0;
};

export const redeemTokens = async (
    bookingId: string,
    tokensToSpend: number
): Promise<{ tokens_spent: number; discount_zar: number; remaining_balance: number }> => {
    const { data, error } = await supabase.rpc("redeem_tokens_for_discount", {
        p_booking_id: bookingId,
        p_tokens_to_spend: tokensToSpend,
    });

    if (error) throw error;

    return {
        tokens_spent: Number(data?.tokens_spent) || 0,
        discount_zar: Number(data?.discount_zar) || 0,
        remaining_balance: Number(data?.remaining_balance) || 0,
    };
};
