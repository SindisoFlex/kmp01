export type InvoiceStatus = "pending" | "paid";

export interface InvoiceRecord {
  id: string;
  booking_id: string;
  user_id: string;
  invoice_number: string;
  amount: number | string;
  currency: string;
  status: InvoiceStatus;
  issued_at: string;
  paid_at: string | null;
  invoice_url?: string | null;
  created_at: string;
}

export interface InvoiceWithBookingAndUser extends InvoiceRecord {
  booking?: {
    id: string;
    type?: string;
    category?: string;
    date_time?: string;
    location?: string | null;
    notes?: string | null;
    payment_status?: string | null;
  } | null;
  userProfile?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}
