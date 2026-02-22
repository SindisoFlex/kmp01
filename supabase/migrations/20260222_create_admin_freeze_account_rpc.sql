-- Security Fix: Create admin_freeze_account RPC Function
-- File: supabase/migrations/20260222_create_admin_freeze_account_rpc.sql
-- Issue: account_status has 'frozen' value but no RPC to set it, forcing direct DB access
-- Impact: Admins cannot freeze accounts programmatically through API
-- Fix: Create secure RPC with admin-only authentication

CREATE OR REPLACE FUNCTION public.admin_freeze_account(
  p_target_user_id UUID,
  p_reason TEXT DEFAULT 'Admin freeze'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID;
  v_actor_role TEXT;
  v_frozen_at TIMESTAMPTZ;
BEGIN
  -- SECURITY: Verify caller is authenticated
  v_actor_id := auth.uid();
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated. Only admins can freeze accounts.';
  END IF;

  -- SECURITY: Verify caller is admin
  SELECT role INTO v_actor_role
  FROM public.profiles
  WHERE id = v_actor_id;

  IF lower(coalesce(v_actor_role, '')) <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can freeze accounts.';
  END IF;

  -- SECURITY: Prevent admin from freezing themselves
  IF p_target_user_id = v_actor_id THEN
    RAISE EXCEPTION 'Cannot freeze your own account.';
  END IF;

  -- Update target user account status to frozen
  UPDATE public.profiles
  SET account_status = 'frozen',
      updated_at = now()
  WHERE id = p_target_user_id;

  -- Log freeze event
  v_frozen_at := now();
  INSERT INTO public.account_lifecycle_warnings (user_id, warning_type, created_at)
  VALUES (p_target_user_id, 'admin_freeze', v_frozen_at);

  -- Audit log entry
  INSERT INTO public.audit_log (actor_user_id, action, table_name, record_id, new_values, created_at)
  VALUES (
    v_actor_id,
    'FREEZE_ACCOUNT',
    'profiles',
    p_target_user_id,
    jsonb_build_object(
      'account_status', 'frozen',
      'reason', p_reason,
      'frozen_by', v_actor_id,
      'frozen_at', v_frozen_at
    ),
    v_frozen_at
  );

  RETURN jsonb_build_object(
    'success', true,
    'frozen_at', v_frozen_at,
    'reason', p_reason,
    'target_user_id', p_target_user_id
  );
END;
$$;

-- Grant execute to authenticated users only
REVOKE EXECUTE ON FUNCTION public.admin_freeze_account(UUID, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_freeze_account(UUID, TEXT) TO authenticated;
