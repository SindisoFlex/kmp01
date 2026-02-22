-- Security Fix: Referral Functions Authorization
-- File: supabase/migrations/[timestamp]_fix_referral_rpc_auth.sql
-- Issue #1: track_referral_open was callable by anonymous users and accepted unchecked referrer_id
-- Issue #2: mark_referral_registered was callable by anonymous users and allowed manipulating any referrer's records
-- Fix: Add authentication, validate caller is the referrer, remove anonymous access

DROP FUNCTION IF EXISTS public.track_referral_open(uuid);
DROP FUNCTION IF EXISTS public.mark_referral_registered(uuid, text, uuid);

-- Fixed version: Only authenticated users can open referrals for THEMSELVES
CREATE OR REPLACE FUNCTION public.track_referral_open()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id uuid;
  v_id UUID;
BEGIN
  -- CRITICAL FIX #1: Validate caller is authenticated
  v_referrer_id := auth.uid();
  IF v_referrer_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated. Only registered users can create referrals.';
  END IF;

  -- Only create referral for the authenticated user (themselves)
  INSERT INTO public.user_referrals (referrer_id, status)
  VALUES (v_referrer_id, 'pending')
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Fixed version: Only authenticated users can register referrals for THEIR OWN referrals
CREATE OR REPLACE FUNCTION public.mark_referral_registered(
  p_referred_email TEXT,
  p_referred_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id uuid;
  v_id UUID;
BEGIN
  -- CRITICAL FIX #1: Validate caller is authenticated
  v_referrer_id := auth.uid();
  IF v_referrer_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated. Only registered users can manage referrals.';
  END IF;

  IF p_referred_user_id IS NULL THEN
    RAISE EXCEPTION 'Referred user ID is required.';
  END IF;

  -- CRITICAL FIX #2: Only allow updating referrals owned by the caller
  UPDATE public.user_referrals
  SET referred_email = COALESCE(p_referred_email, referred_email),
      referred_user_id = p_referred_user_id,
      status = 'registered'
  WHERE referrer_id = v_referrer_id
    AND referred_user_id IS NULL
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1
  RETURNING id INTO v_id;

  -- CRITICAL FIX #3: If no pending referral exists for caller, create one
  -- (This handles the case where referral was opened before user login)
  IF v_id IS NULL THEN
    INSERT INTO public.user_referrals (referrer_id, referred_email, referred_user_id, status)
    VALUES (v_referrer_id, p_referred_email, p_referred_user_id, 'registered')
    RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$$;

-- Restrict access to authenticated users only (remove anon)
REVOKE EXECUTE ON FUNCTION public.track_referral_open() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.track_referral_open() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.mark_referral_registered(text, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.mark_referral_registered(text, uuid) TO authenticated;
