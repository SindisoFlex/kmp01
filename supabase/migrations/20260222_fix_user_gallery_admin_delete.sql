-- Security Fix: Add Admin DELETE Policy to user_gallery Table
-- File: supabase/migrations/20260222_fix_user_gallery_admin_delete.sql
-- Issue: user_gallery table missing admin DELETE policy, preventing content moderation
-- Impact: Admins cannot remove inappropriate/abusive user-uploaded media
-- Fix: Add DELETE policy for admins

CREATE POLICY "Admins can delete gallery media"
ON public.user_gallery FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(coalesce(p.role, '')) = 'admin'
  )
);
