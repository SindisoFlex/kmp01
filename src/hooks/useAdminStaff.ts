import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useAdminStaff = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['admin-staff-full'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['staff', 'admin']);

            if (error) {
                console.error("Error fetching staff:", error);
                return [];
            }

            return data.map((staff: any) => ({
                id: staff.id,
                name: staff.name || "Unnamed Staff",
                email: staff.email || "No Email",
                phone: staff.phone || "N/A",
                whatsapp: staff.phone || "N/A", // Defaulting to phone if separate field not exist
                role: staff.metadata?.role || staff.role || "Staff",
                specialty: staff.metadata?.specialty || "General",
                joinDate: new Date(staff.created_at).toISOString().split('T')[0],
                status: staff.status || "active",
                clients: 0, // Staff-client assignment logic omitted for schema safety
                activeTasks: 0
            }));
        }
    });

    const updateStaff = useMutation({
        mutationFn: async (updatedStaff: any) => {
            // In a real scenario, role and specialty might go into a metadata JSONB column if they aren't dedicated columns
            const { error } = await supabase.from('profiles').update({
                name: updatedStaff.name,
                phone: updatedStaff.phone,
                status: updatedStaff.status,
                metadata: {
                    role: updatedStaff.role,
                    specialty: updatedStaff.specialty
                }
            }).eq('id', updatedStaff.id);

            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-staff-full'] })
    });

    const removeStaff = useMutation({
        mutationFn: async (id: string) => {
            // Caution: Removing staff might just mean demoting their role or deactivating them.
            const { error } = await supabase.from('profiles').update({ role: 'client', status: 'inactive' }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-staff-full'] })
    });

    return {
        staffList: query.data || [],
        isLoading: query.isLoading,
        updateStaff: updateStaff.mutateAsync,
        removeStaff: removeStaff.mutateAsync
    };
};
