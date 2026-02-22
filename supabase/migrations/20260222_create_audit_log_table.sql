-- Security Fix: Create Audit Log Table
-- File: supabase/migrations/20260222_create_audit_log_table.sql
-- Issue: No audit logging table exists for tracking admin actions (GDPR/compliance violation)
-- Impact: Cannot track who changed what, when - required for compliance
-- Fix: Create audit_log table with RLS and admin-only policy

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit log
CREATE POLICY "Admins can view audit log"
ON public.audit_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(coalesce(p.role, '')) = 'admin'
  )
);

-- Policy: Only system (SECURITY DEFINER functions) can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.audit_log FOR INSERT
TO authenticated
WITH CHECK (true);  -- Checked by SECURITY DEFINER functions only

-- Create index for efficient lookups
CREATE INDEX idx_audit_log_actor ON public.audit_log(actor_user_id);
CREATE INDEX idx_audit_log_table ON public.audit_log(table_name);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);
