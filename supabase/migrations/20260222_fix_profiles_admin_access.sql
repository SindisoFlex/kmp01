-- Security Fix: Add Admin Access Policies to profiles Table
-- File: supabase/migrations/20260222_fix_profiles_admin_access.sql
-- Issue: profiles table missing admin INSERT/UPDATE/DELETE policies
-- Impact: Admins cannot directly create or manage user profiles
-- Fix: Add comprehensive admin policy allowing full CRUD access

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
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
