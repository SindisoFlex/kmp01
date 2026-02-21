import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useAdminDashboardStats = () => {
    return useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: async () => {
            // Count clients
            const { count: totalClients } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'client');

            // Count staff
            const { count: totalStaff } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'staff');

            // Active bookings (Pending or Confirmed)
            const { count: activeBookings } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .in('status', ['Pending', 'Confirmed']);

            // Pending approvals
            const { count: pendingApprovals } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Pending');

            // Completed bookings
            const { count: completedBookings } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Completed');

            // Calculate revenue from paid invoices
            const { data: paidInvoices } = await supabase
                .from('invoices')
                .select('amount')
                .eq('status', 'paid');

            const totalRevenue = paidInvoices?.reduce((sum, inv) => sum + Number(inv.amount || 0), 0) || 0;

            // Clients joined this month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { count: newClientsThisMonth } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'client')
                .gte('created_at', startOfMonth.toISOString());

            // Recent Pending Approvals list
            const { data: pendingBookingsList } = await supabase
                .from('bookings')
                .select('*, user:profiles(name)')
                .eq('status', 'Pending')
                .order('created_at', { ascending: false })
                .limit(5);

            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const { data: todayScheduleList } = await supabase
                .from('bookings')
                .select('*, user:profiles(name)')
                .gte('date_time', todayStart.toISOString())
                .lte('date_time', todayEnd.toISOString())
                .in('status', ['Confirmed', 'Pending'])
                .order('date_time', { ascending: true })
                .limit(5);

            // Recent Completed/Loyalty (Mocking just the structure for now, until loyalty tracks are queried)
            const loyaltyMilestones = 0;

            // Upcoming Sessions List
            const { data: upcomingSessions } = await supabase
                .from('bookings')
                .select('*, user:profiles(name)')
                .gte('date_time', new Date().toISOString())
                .in('status', ['Confirmed', 'Pending'])
                .order('date_time', { ascending: true })
                .limit(3);

            // Active Staff List
            const { data: staffMembers } = await supabase
                .from('profiles')
                .select('name, created_at')
                .eq('role', 'staff')
                .limit(4);

            return {
                totalClients: totalClients || 0,
                totalStaff: totalStaff || 0,
                activeBookings: activeBookings || 0,
                completedBookings: completedBookings || 0,
                totalRevenue: `R${totalRevenue.toLocaleString()}`,
                newClientsThisMonth: newClientsThisMonth || 0,
                messagesUnread: 0, // Not implemented yet
                pendingApprovals: pendingApprovals || 0,
                loyaltyMilestones,
                pendingBookingsList: pendingBookingsList || [],
                todayScheduleList: todayScheduleList || [],
                upcomingSessions: upcomingSessions || [],
                staffMembers: staffMembers || []
            };
        }
    });
};
