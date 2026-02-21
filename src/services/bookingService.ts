
import { supabase } from "@/lib/supabase";
import { Booking } from "@/types/booking";
import { getInvoicesByBookingIds } from "@/services/invoiceService";

type CreateBookingInput = {
    service: string;
    category: string;
    date?: string;
    location: string;
    description?: string;
    extras?: string[];
};

/**
 * Creates a new booking using the secure backend RPC.
 * This ensures pricing and discounts are calculated server-side.
 */
export const createBooking = async (bookingData: CreateBookingInput): Promise<Booking> => {
    const { data: result, error } = await supabase.rpc("create_secure_booking", {
        p_service_type: bookingData.service,
        p_category: bookingData.category,
        p_extras: bookingData.extras || [],
        p_date_time: bookingData.date,
        p_location: bookingData.location,
        p_notes: bookingData.description || ""
    });

    if (error) {
        console.error("RPC Error:", error);
        throw error;
    }

    // Find the created booking to return full data
    const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", result.id)
        .single();

    if (fetchError) throw fetchError;
    return booking as Booking;
};

export const getBookings = async (userId: string): Promise<Booking[]> => {
    const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;

    const bookings = (data || []) as Booking[];
    const invoiceMap = await getInvoicesByBookingIds(bookings.map((b) => b.id));

    return bookings.map((booking) => ({
        ...booking,
        invoice: invoiceMap.get(booking.id) || null,
    }));
};

export const getBookingById = async (id: string): Promise<Booking> => {
    const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as Booking;
};

// Stubs for removed token functionality to prevent breaking imports
export const getTokenTransactions = async (userId: string) => [];
export const awardTokensForBooking = async (bookingId: string) => ({ success: true });
export const completeBookingPayment = async (bookingId: string, amount: number) => {
    const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "Completed" })
        .eq("id", bookingId);

    if (updateError) {
        throw new Error(`Failed to mark booking ${bookingId} as completed: ${updateError.message}`);
    }

    const { error: loyaltyError } = await supabase.rpc("apply_completed_booking_to_loyalty", {
        p_booking_id: bookingId,
    });

    if (loyaltyError) {
        throw new Error(`Loyalty update failed for booking ${bookingId}: ${loyaltyError.message}`);
    }

    console.log(`Payment processed for booking ${bookingId}: R${amount}. Booking completion and loyalty updates applied server-side.`);
    return { success: true };
};
