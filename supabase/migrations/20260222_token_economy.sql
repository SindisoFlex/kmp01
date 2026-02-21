-- =========================================================================
-- TOKEN ECONOMY — Tables, RPCs, RLS
-- =========================================================================

-- 1. Per-user token balance
CREATE TABLE IF NOT EXISTS public.user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_earned >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_tokens_user ON public.user_tokens (user_id);

ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own token balance" ON public.user_tokens;
CREATE POLICY "Users can read own token balance"
ON public.user_tokens FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage tokens" ON public.user_tokens;
CREATE POLICY "Admins can manage tokens"
ON public.user_tokens FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'));

-- 2. Token transaction ledger
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID NULL REFERENCES public.bookings(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'bonus', 'adjustment')),
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_transactions_user ON public.token_transactions (user_id, created_at DESC);

ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own token transactions" ON public.token_transactions;
CREATE POLICY "Users can read own token transactions"
ON public.token_transactions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage token transactions" ON public.token_transactions;
CREATE POLICY "Admins can manage token transactions"
ON public.token_transactions FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'));

-- =========================================================================
-- RPC: Award tokens after payment (called by admin_mark_booking_paid)
-- =========================================================================
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
  v_tokens INTEGER;
BEGIN
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

  -- Ledger entry
  INSERT INTO public.token_transactions (user_id, booking_id, amount, type, description)
  VALUES (
    p_user_id,
    p_booking_id,
    v_tokens,
    'earn',
    'Earned from payment of R' || TRIM(TO_CHAR(p_amount_paid, '999999990.00'))
  );

  RETURN v_tokens;
END;
$$;

-- =========================================================================
-- RPC: First-login welcome bonus (idempotent)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.credit_first_login_bonus()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_already_claimed BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if bonus was already claimed
  SELECT EXISTS (
    SELECT 1 FROM public.token_transactions
    WHERE user_id = v_user_id AND type = 'bonus' AND description LIKE '%Welcome%'
  ) INTO v_already_claimed;

  IF v_already_claimed THEN
    RETURN 0;
  END IF;

  -- Credit 150 tokens
  INSERT INTO public.user_tokens (user_id, balance, lifetime_earned, updated_at)
  VALUES (v_user_id, 150, 150, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = public.user_tokens.balance + 150,
    lifetime_earned = public.user_tokens.lifetime_earned + 150,
    updated_at = NOW();

  INSERT INTO public.token_transactions (user_id, booking_id, amount, type, description)
  VALUES (v_user_id, NULL, 150, 'bonus', 'Welcome bonus — 150 tokens');

  RETURN 150;
END;
$$;

-- =========================================================================
-- RPC: Redeem tokens for discount (max 25% of booking value)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.redeem_tokens_for_discount(
  p_booking_id UUID,
  p_tokens_to_spend INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_booking RECORD;
  v_max_discount NUMERIC;
  v_max_tokens INTEGER;
  v_actual_tokens INTEGER;
  v_discount NUMERIC;
  v_current_balance INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_tokens_to_spend <= 0 THEN
    RAISE EXCEPTION 'Token amount must be positive';
  END IF;

  -- Get booking
  SELECT id, total_amount, user_id
  INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id AND user_id = v_user_id
  LIMIT 1;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking not found or not owned by user';
  END IF;

  -- Max 25% of booking value
  v_max_discount := COALESCE(v_booking.total_amount, 0) * 0.25;
  -- 1 token = R10
  v_max_tokens := floor(v_max_discount / 10);

  -- Cap to max
  v_actual_tokens := LEAST(p_tokens_to_spend, v_max_tokens);

  IF v_actual_tokens <= 0 THEN
    RAISE EXCEPTION 'No tokens can be applied (booking value too low)';
  END IF;

  -- Check balance
  SELECT balance INTO v_current_balance
  FROM public.user_tokens
  WHERE user_id = v_user_id;

  v_current_balance := COALESCE(v_current_balance, 0);

  IF v_current_balance < v_actual_tokens THEN
    RAISE EXCEPTION 'Insufficient token balance (have %, need %)', v_current_balance, v_actual_tokens;
  END IF;

  -- Deduct
  UPDATE public.user_tokens
  SET balance = balance - v_actual_tokens,
      updated_at = NOW()
  WHERE user_id = v_user_id;

  v_discount := v_actual_tokens * 10;

  -- Ledger
  INSERT INTO public.token_transactions (user_id, booking_id, amount, type, description)
  VALUES (
    v_user_id,
    p_booking_id,
    -v_actual_tokens,
    'spend',
    'Redeemed ' || v_actual_tokens || ' tokens for R' || v_discount || ' discount'
  );

  RETURN jsonb_build_object(
    'tokens_spent', v_actual_tokens,
    'discount_zar', v_discount,
    'remaining_balance', v_current_balance - v_actual_tokens
  );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.award_tokens_on_payment(UUID, UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.credit_first_login_bonus() TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_tokens_for_discount(UUID, INTEGER) TO authenticated;
