-- Security Fix: Add RLS to bookings Table
-- File: supabase/migrations/[timestamp]_add_bookings_rls.sql
-- Issue: bookings table had NO RLS, allowing any authenticated user to read/modify all bookings
-- Fix: Enable RLS and create policies for users and admins

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Users can create bookings for themselves
CREATE POLICY "Users can insert own bookings"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own bookings (status, notes, etc.)
CREATE POLICY "Users can update own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings"
ON public.bookings FOR ALL
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
