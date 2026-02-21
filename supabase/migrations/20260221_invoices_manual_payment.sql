-- Minimal production-safe invoice system for manual bank deposit confirmation

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending'
CHECK (payment_status IN ('pending', 'paid'));

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid')),
  issued_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_created_at
ON public.invoices (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_booking_id
ON public.invoices (booking_id);

CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_date timestamptz DEFAULT now())
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_year TEXT;
  v_next_seq INTEGER;
BEGIN
  v_year := to_char(p_date, 'YYYY');

  SELECT COALESCE(MAX((regexp_match(invoice_number, 'INV-' || v_year || '-([0-9]+)$'))[1]::INTEGER), 0) + 1
  INTO v_next_seq
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || v_year || '-%';

  RETURN 'INV-' || v_year || '-' || lpad(v_next_seq::TEXT, 3, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_mark_booking_paid(p_booking_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID;
  v_actor_role TEXT;
  v_booking RECORD;
  v_existing_invoice RECORD;
  v_invoice_id UUID;
  v_invoice_number TEXT;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role INTO v_actor_role
  FROM public.profiles
  WHERE id = v_actor
  LIMIT 1;

  IF lower(coalesce(v_actor_role, '')) <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can mark bookings as paid';
  END IF;

  SELECT id, user_id, total_amount, payment_status
  INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  LIMIT 1;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking % not found', p_booking_id;
  END IF;

  UPDATE public.bookings
  SET payment_status = 'paid'
  WHERE id = p_booking_id;

  SELECT id, invoice_number, status, paid_at
  INTO v_existing_invoice
  FROM public.invoices
  WHERE booking_id = p_booking_id
  LIMIT 1;

  IF v_existing_invoice.id IS NOT NULL THEN
    UPDATE public.invoices
    SET status = 'paid',
        paid_at = COALESCE(v_existing_invoice.paid_at, now())
    WHERE id = v_existing_invoice.id;

    RETURN jsonb_build_object(
      'invoice_id', v_existing_invoice.id,
      'invoice_number', v_existing_invoice.invoice_number,
      'status', 'paid',
      'updated_existing', true
    );
  END IF;

  v_invoice_number := public.generate_invoice_number(now());

  INSERT INTO public.invoices (
    booking_id,
    user_id,
    invoice_number,
    amount,
    currency,
    status,
    issued_at,
    paid_at
  ) VALUES (
    p_booking_id,
    v_booking.user_id,
    v_invoice_number,
    COALESCE(v_booking.total_amount, 0),
    'ZAR',
    'paid',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_invoice_id;

  RETURN jsonb_build_object(
    'invoice_id', v_invoice_id,
    'invoice_number', v_invoice_number,
    'status', 'paid',
    'updated_existing', false
  );
END;
$$;

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
CREATE POLICY "Admins can manage invoices"
ON public.invoices
FOR ALL
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
