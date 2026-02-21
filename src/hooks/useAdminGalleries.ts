import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useAdminGalleries = () => {
    const queryClient = useQueryClient();

    const galleriesQuery = useQuery({
        queryKey: ['admin-galleries'],
        queryFn: async () => {
            // Attempt to fetch galleries with related client/staff data if foreign keys exist
            const { data, error } = await supabase
                .from('galleries')
                .select(`
          *,
          client:profiles!client_id ( name ),
          photographer:profiles!photographer_id ( name )
        `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching galleries:", error);
                return [];
            }

            return data.map((g: any) => ({
                id: g.id,
                title: g.title || "Untitled Gallery",
                category: g.category || "wedding",
                description: g.description || "",
                client: g.client?.name || "Unknown Client",
                clientId: g.client_id || null,
                date: g.date || g.created_at,
                createdAt: g.created_at,
                expirationDate: g.expiration_date || null,
                photographer: g.photographer?.name || "N/A",
                photographerId: g.photographer_id || null,
                coverImage: g.cover_image || "https://images.unsplash.com/photo-1552334405-4929f2ab35ba?w=800&auto=format&fit=crop",
                imageCount: g.image_count || 0,
                videoCount: g.video_count || 0,
                views: g.views || 0,
                downloads: g.downloads || 0,
                type: g.type || "private", // "public" or "private"
                downloadEnabled: g.download_enabled !== false,
                featured: g.featured === true,
                status: g.status || "active"
            }));
        }
    });

    const staffQuery = useQuery({
        queryKey: ['admin-staff'],
        queryFn: async () => {
            const { data } = await supabase.from('profiles').select('id, name').eq('role', 'staff');
            return data?.map(d => ({ id: d.id, name: d.name || "Staff" })) || [];
        }
    });

    const clientsQuery = useQuery({
        queryKey: ['admin-clients-list'],
        queryFn: async () => {
            const { data } = await supabase.from('profiles').select('id, name').eq('role', 'client');
            return data?.map(d => ({ id: d.id, name: d.name || "Client" })) || [];
        }
    });

    const createGallery = useMutation({
        mutationFn: async (newGallery: any) => {
            const { data, error } = await supabase.from('galleries').insert({
                title: newGallery.title,
                category: newGallery.category,
                description: newGallery.description,
                client_id: newGallery.clientId || null,
                date: newGallery.date,
                photographer_id: newGallery.photographerId || null,
                type: newGallery.type,
                download_enabled: newGallery.downloadEnabled,
                featured: newGallery.featured,
                expiration_date: newGallery.expirationDate || null,
                status: 'active'
            }).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-galleries'] })
    });

    const updateGallery = useMutation({
        mutationFn: async (updatedGallery: any) => {
            const { data, error } = await supabase.from('galleries').update({
                title: updatedGallery.title,
                category: updatedGallery.category,
                description: updatedGallery.description,
                client_id: updatedGallery.clientId || null,
                date: updatedGallery.date,
                photographer_id: updatedGallery.photographerId || null,
                type: updatedGallery.type,
                download_enabled: updatedGallery.downloadEnabled,
                featured: updatedGallery.featured,
                expiration_date: updatedGallery.expirationDate || null,
                status: updatedGallery.status
            }).eq('id', updatedGallery.id);

            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-galleries'] })
    });

    const deleteGallery = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('galleries').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-galleries'] })
    });

    return {
        galleries: galleriesQuery.data || [],
        isLoading: galleriesQuery.isLoading,
        staffList: staffQuery.data || [],
        clientsList: clientsQuery.data || [],
        createGallery: createGallery.mutateAsync,
        updateGallery: updateGallery.mutateAsync,
        deleteGallery: deleteGallery.mutateAsync
    };
};
