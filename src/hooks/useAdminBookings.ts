import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { adminMarkBookingPaid } from "@/services/invoiceService";

export const useAdminBookings = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-bookings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
          *,
          user:profiles!user_id ( name, email, phone )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return Promise.all(data.map(async (b: any) => {
                // Fetch invoice separately to avoid deep nested errors if schema differs
                const { data: inv } = await supabase.from('invoices').select('*').eq('booking_id', b.id).maybeSingle();

                return {
                    id: b.id,
                    clientName: b.user?.name || "Unknown Client",
                    clientEmail: b.user?.email || "N/A",
                    clientPhone: b.user?.phone || "N/A",
                    service: b.type || "Service",
                    category: b.type || "Service",
                    subcategory: "",
                    date: b.date_time || b.created_at,
                    location: b.location || b.address || "TBD",
                    // Maps Supabase status (Pending, Confirmed, Completed, Cancelled) to UI expects (pending, upcoming, completed, canceled)
                    status: b.status === 'Confirmed' ? 'upcoming' : b.status?.toLowerCase() || "pending",
                    staff: null,
                    price: b.total_amount || 0,
                    notes: b.notes || "",
                    createdAt: b.created_at,
                    galleryStatus: "not_started",
                    payment_status: inv?.status === 'paid' ? 'paid' : (b.payment_status || 'pending'),
                    invoice_number: inv?.invoice_number || b.invoice_number,
                };
            }));
        }
    });

    const staffQuery = useQuery({
        queryKey: ['admin-staff'],
        queryFn: async () => {
            const { data } = await supabase.from('profiles').select('id, name, role').eq('role', 'staff');
            return data?.map(d => ({ id: d.id, name: d.name || "Staff", specialty: "General" })) || [];
        }
    });

    const approveBooking = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('bookings').update({ status: 'Confirmed' }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
    });

    const rejectBooking = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('bookings').update({ status: 'Cancelled' }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
    });

    const completeBooking = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('bookings').update({ status: 'Completed' }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
    });

    return {
        bookings: query.data || [],
        isLoading: query.isLoading,
        staffMembers: staffQuery.data || [],
        approveBooking: approveBooking.mutateAsync,
        rejectBooking: rejectBooking.mutateAsync,
        completeBooking: completeBooking.mutateAsync
    };
};
