-- =========================================================================
-- ACCOUNT LIFECYCLE ENHANCEMENT — Warnings, Reactivation Events
-- =========================================================================

-- 1. Lifecycle warning audit trail
CREATE TABLE IF NOT EXISTS public.account_lifecycle_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  warning_type TEXT NOT NULL CHECK (warning_type IN ('90_day', '30_day', '7_day')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, warning_type)
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_warnings_user
ON public.account_lifecycle_warnings (user_id);

ALTER TABLE public.account_lifecycle_warnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own lifecycle warnings" ON public.account_lifecycle_warnings;
CREATE POLICY "Users can read own lifecycle warnings"
ON public.account_lifecycle_warnings FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage lifecycle warnings" ON public.account_lifecycle_warnings;
CREATE POLICY "Admins can manage lifecycle warnings"
ON public.account_lifecycle_warnings FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'));

-- 2. Reactivation events log
CREATE TABLE IF NOT EXISTS public.reactivation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fee_paid NUMERIC(12,2) NOT NULL DEFAULT 300,
  payment_reference TEXT NOT NULL DEFAULT '',
  reactivated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reactivation_events_user
ON public.reactivation_events (user_id);

ALTER TABLE public.reactivation_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own reactivation events" ON public.reactivation_events;
CREATE POLICY "Users can read own reactivation events"
ON public.reactivation_events FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage reactivation events" ON public.reactivation_events;
CREATE POLICY "Admins can manage reactivation events"
ON public.reactivation_events FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'));

-- 3. Enhanced lifecycle handler with warning phases
CREATE OR REPLACE FUNCTION public.handle_loyalty_lifecycle() RETURNS VOID AS $$
BEGIN
  -- Phase 1: 90-day warning (users inactive for 21 months)
  INSERT INTO public.account_lifecycle_warnings (user_id, warning_type)
  SELECT p.id, '90_day'
  FROM public.profiles p
  WHERE p.account_status = 'active'
    AND COALESCE(p.last_activity_at, p.created_at) < NOW() - INTERVAL '21 months'
    AND NOT EXISTS (
      SELECT 1 FROM public.account_lifecycle_warnings w
      WHERE w.user_id = p.id AND w.warning_type = '90_day'
    )
  ON CONFLICT (user_id, warning_type) DO NOTHING;

  -- Phase 2: 30-day warning (users inactive for 23 months)
  INSERT INTO public.account_lifecycle_warnings (user_id, warning_type)
  SELECT p.id, '30_day'
  FROM public.profiles p
  WHERE p.account_status = 'active'
    AND COALESCE(p.last_activity_at, p.created_at) < NOW() - INTERVAL '23 months'
    AND NOT EXISTS (
      SELECT 1 FROM public.account_lifecycle_warnings w
      WHERE w.user_id = p.id AND w.warning_type = '30_day'
    )
  ON CONFLICT (user_id, warning_type) DO NOTHING;

  -- Phase 3: 7-day warning (users inactive for ~23.75 months)
  INSERT INTO public.account_lifecycle_warnings (user_id, warning_type)
  SELECT p.id, '7_day'
  FROM public.profiles p
  WHERE p.account_status = 'active'
    AND COALESCE(p.last_activity_at, p.created_at) < NOW() - INTERVAL '717 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.account_lifecycle_warnings w
      WHERE w.user_id = p.id AND w.warning_type = '7_day'
    )
  ON CONFLICT (user_id, warning_type) DO NOTHING;

  -- Phase 4: Freeze accounts past 24 months inactivity
  UPDATE public.profiles
  SET account_status = 'frozen'
  WHERE account_status = 'active'
    AND COALESCE(last_activity_at, created_at) < NOW() - INTERVAL '24 months';

  -- Phase 5: Clear warnings for users whose accounts are now frozen (cycle complete)
  -- Warnings stay for audit — no deletion

  -- Phase 6: Tier downgrade for 12-month inactivity
  UPDATE public.profiles
  SET membership_tier = CASE
    WHEN membership_tier = 'vip' THEN 'gold'
    WHEN membership_tier = 'gold' THEN 'silver'
    WHEN membership_tier = 'silver' THEN 'bronze'
    WHEN membership_tier = 'bronze' THEN 'free'
    ELSE 'free'
  END
  WHERE last_activity_at < NOW() - INTERVAL '12 months'
    AND membership_tier != 'free'
    AND account_status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enhanced reactivation function with event logging + token preservation
CREATE OR REPLACE FUNCTION public.reactivate_frozen_account(
  p_payment_reference TEXT,
  p_fee_paid NUMERIC DEFAULT 300
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_status TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT account_status INTO v_status
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF lower(coalesce(v_status, '')) NOT IN ('frozen', 'suspended') THEN
    RAISE EXCEPTION 'Account is not frozen/suspended';
  END IF;

  -- Reactivate: set status to active, refresh activity timestamp
  UPDATE public.profiles
  SET account_status = 'active',
      last_activity_at = NOW()
  WHERE id = v_user_id;

  -- Clear lifecycle warnings for fresh cycle
  DELETE FROM public.account_lifecycle_warnings
  WHERE user_id = v_user_id;

  -- Log reactivation event
  INSERT INTO public.reactivation_events (user_id, fee_paid, payment_reference)
  VALUES (v_user_id, p_fee_paid, COALESCE(NULLIF(TRIM(p_payment_reference), ''), 'reactivate-' || extract(epoch from now())::text));

  -- Tokens are preserved (no deletion) — Option A

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'new_status', 'active',
    'tokens_preserved', true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.reactivate_frozen_account(TEXT, NUMERIC) TO authenticated;
