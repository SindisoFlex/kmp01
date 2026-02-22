-- Security Fix: Enable RLS on invoice_email_queue Table
-- File: supabase/migrations/20260222_fix_invoice_email_queue_rls.sql
-- Issue: invoice_email_queue table had NO RLS, allowing any authenticated user to read/modify all email records
-- Impact: CRITICAL - Users could leak other users' email addresses and email queue status
-- Fix: Enable RLS and create admin-only policy

ALTER TABLE public.invoice_email_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view and manage email queue
CREATE POLICY "Admins can manage invoice email queue"
ON public.invoice_email_queue FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(coalesce(p.role, '')) = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(coalesce(p.role, '')) = 'admin'
  )
);
