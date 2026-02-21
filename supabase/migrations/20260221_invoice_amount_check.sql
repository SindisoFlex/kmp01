-- Prevent negative invoice amounts
ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_amount_positive CHECK (amount >= 0);
