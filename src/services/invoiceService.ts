import { supabase } from "@/lib/supabase";
import { InvoiceRecord, InvoiceWithBookingAndUser } from "@/types/invoice";

export const getUserInvoices = async (userId: string): Promise<InvoiceRecord[]> => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as InvoiceRecord[];
};

export const getInvoiceByIdForUser = async (invoiceId: string, userId: string): Promise<InvoiceWithBookingAndUser | null> => {
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (invoiceError) throw invoiceError;
  if (!invoice) return null;

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, type, category, date_time, location, notes, payment_status")
    .eq("id", invoice.booking_id)
    .maybeSingle();

  if (bookingError) throw bookingError;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, email, phone")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw profileError;

  return {
    ...(invoice as InvoiceRecord),
    booking: booking || null,
    userProfile: profile || null,
  };
};

export const getInvoicesByBookingIds = async (bookingIds: string[]): Promise<Map<string, InvoiceRecord>> => {
  if (bookingIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .in("booking_id", bookingIds);

  if (error) throw error;

  const map = new Map<string, InvoiceRecord>();
  (data || []).forEach((invoice) => {
    const typed = invoice as InvoiceRecord;
    map.set(typed.booking_id, typed);
  });
  return map;
};

export const adminMarkBookingPaid = async (bookingId: string) => {
  const { data, error } = await supabase.rpc("admin_mark_booking_paid", {
    p_booking_id: bookingId,
  });

  if (error) throw error;
  return data;
};

// downloadInvoiceFile removed — replaced by pdfInvoiceService.ts
