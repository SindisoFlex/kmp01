import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MembershipTier } from '@/utils/loyaltyUtils';

export const useAdminClients = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-clients'],
        queryFn: async () => {
            // Fetch clients with their bookings and galleries to calculate aggregates
            const { data: clients, error } = await supabase
                .from('profiles')
                .select(`
          id,
          name,
          email,
          phone,
          created_at,
          updated_at,
          role,
          bookings ( id, total_amount, status, date_time, type ),
          galleries ( id, title, type )
        `)
                .eq('role', 'client');

            if (error) throw error;

            let loyaltyData: any[] = [];
            try {
                const { data } = await supabase.from('loyalty_programs').select('*').in('user_id', clients.map((c: any) => c.id));
                if (data) loyaltyData = data;
            } catch (e) {
                // Fallback
            }

            return clients.map((client: any) => {
                const clientBookings = client.bookings || [];
                const clientGalleries = client.galleries || [];
                const loyaltyInfo = loyaltyData?.find((l: any) => l.user_id === client.id);

                const bookingsCount = clientBookings.length;
                const totalValue = clientBookings.reduce((sum: number, b: any) => sum + (Number(b.total_amount) || 0), 0);

                let lastActivity = client.updated_at || client.created_at;
                if (clientBookings.length > 0) {
                    const latestBooking = [...clientBookings].sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime())[0];
                    lastActivity = latestBooking.date_time || lastActivity;
                }

                return {
                    id: client.id,
                    name: client.name || "Unnamed Client",
                    email: client.email || "No Email",
                    phone: client.phone || "N/A",
                    whatsapp: client.phone || "N/A",
                    joinDate: new Date(client.created_at).toLocaleDateString(),
                    lastActivity: new Date(lastActivity).toLocaleDateString(),
                    membershipTier: (loyaltyInfo?.tier?.toLowerCase() || 'bronze') as MembershipTier,
                    bookingsCount,
                    bookingsValue: `R${totalValue.toLocaleString()}`,
                    activeGalleries: clientGalleries.length,
                    assignedStaff: "N/A", // Staff assignment at client level isn't in standard schema
                    status: 'active',
                    // Attached details for the profile dialog natively
                    recentBookings: clientBookings.slice(0, 5).map((b: any) => ({
                        id: b.id,
                        date: new Date(b.date_time).toLocaleDateString(),
                        service: b.type,
                        status: b.status?.toLowerCase() || 'pending'
                    })),
                    recentGalleries: clientGalleries.slice(0, 5).map((g: any) => ({
                        id: g.id,
                        title: g.title || "Untitled",
                        type: g.type || "Gallery"
                    }))
                };
            });
        }
    });

    const updateClientTier = useMutation({
        mutationFn: async ({ clientId, tier }: { clientId: string, tier: string }) => {
            // In a real app, you'd update loyalty_programs table.
            const { error } = await supabase.from('loyalty_programs').upsert({ user_id: clientId, tier: tier.toUpperCase(), updated_at: new Date().toISOString() });
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-clients'] })
    });

    return {
        clients: query.data || [],
        isLoading: query.isLoading,
        updateTier: updateClientTier.mutateAsync
    };
};
