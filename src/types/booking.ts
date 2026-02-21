
export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Booking {
    id: string;
    user_id: string;
    type: 'Photography' | 'Videography' | 'Web Design' | 'AI Training';
    date_time: string;
    location?: string;
    address?: string;
    notes?: string;
    status: BookingStatus;
    payment_status?: 'pending' | 'paid';
    created_at: string;
    total_amount: number;
    staff_discount_applied: boolean;
    invoice?: {
        id: string;
        invoice_number: string;
        paid_at: string | null;
        status: 'pending' | 'paid';
        amount: number | string;
        currency: string;
    } | null;
}

export interface BookingFormData {
    service: string;
    category: string;
    date?: string | Date;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
    attachments: File[];
    extras: string[];
    base_price?: number;
}

export type TransactionType = 'EARN' | 'SPEND' | 'BONUS' | 'REFUND' | 'ADMIN_ADJUSTMENT' | 'REVERSAL';

export interface TokenTransaction {
    id: string;
    user_id: string;
    amount: number;
    type: TransactionType;
    booking_id?: string;
    description: string;
    created_at: string;
    metadata?: Record<string, unknown>;
}
