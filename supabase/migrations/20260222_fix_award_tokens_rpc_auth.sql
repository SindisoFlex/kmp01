-- Security Fix: award_tokens_on_payment Authorization
-- File: supabase/migrations/[timestamp]_fix_token_award_rpc_auth.sql
-- Issue: Function accepted unchecked p_user_id parameter, allowing any user to award tokens to any other user
-- Fix: Add authentication and validation that caller is admin or owns target user_id

DROP FUNCTION IF EXISTS public.award_tokens_on_payment(uuid, uuid, numeric);

CREATE OR REPLACE FUNCTION public.award_tokens_on_payment(
  p_user_id UUID,
  p_booking_id UUID,
  p_amount_paid NUMERIC
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_user_id uuid;
  v_actor_role text;
  v_tokens INTEGER;
BEGIN
  -- CRITICAL FIX #1: Validate caller is authenticated
  v_actor_user_id := auth.uid();
  IF v_actor_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated. Token awards require authentication.';
  END IF;

  -- CRITICAL FIX #2: Get caller role for authorization
  SELECT role INTO v_actor_role
  FROM public.profiles
  WHERE id = v_actor_user_id
  LIMIT 1;

  -- CRITICAL FIX #3: Validate caller is authorized to award tokens
  -- Only allow if:
  -- 1. Caller owns the target user_id (rare, but self-award for edge cases)
  -- 2. Caller is admin (system can award tokens to users)
  IF v_actor_user_id <> p_user_id THEN
    IF lower(coalesce(v_actor_role, '')) <> 'admin' THEN
      RAISE EXCEPTION 'Only admins can award tokens to other users. You can only award tokens to your own account.';
    END IF;
  END IF;

  -- CRITICAL FIX #4: Validate p_amount_paid is reasonable (prevent overflow attacks)
  IF p_amount_paid < 0 OR p_amount_paid > 999999999 THEN
    RAISE EXCEPTION 'Invalid payment amount: % must be between 0 and 999999999.', p_amount_paid;
  END IF;

  -- 1 token per R10 spent → 10 tokens per R100
  v_tokens := floor(COALESCE(p_amount_paid, 0) / 100) * 10;

  IF v_tokens <= 0 THEN
    RETURN 0;
  END IF;

  -- Upsert balance
  INSERT INTO public.user_tokens (user_id, balance, lifetime_earned, updated_at)
  VALUES (p_user_id, v_tokens, v_tokens, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = public.user_tokens.balance + v_tokens,
    lifetime_earned = public.user_tokens.lifetime_earned + v_tokens,
    updated_at = NOW();

  -- Ledger entry with audit trail
  INSERT INTO public.token_transactions (user_id, booking_id, amount, type, description)
  VALUES (
    p_user_id,
    p_booking_id,
    v_tokens,
    'earn',
    'Earned from payment of R' || TRIM(TO_CHAR(p_amount_paid, '999999990.00')) || ' (awarded by ' || v_actor_user_id || ')'
  );

  RETURN v_tokens;
END;
$$;

-- Restrict access to authenticated users only (no anon)
REVOKE EXECUTE ON FUNCTION public.award_tokens_on_payment(uuid, uuid, numeric) FROM public;
GRANT EXECUTE ON FUNCTION public.award_tokens_on_payment(uuid, uuid, numeric) TO authenticated;
