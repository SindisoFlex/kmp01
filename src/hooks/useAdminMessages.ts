import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useAdminMessages = () => {
    const queryClient = useQueryClient();

    const conversationsQuery = useQuery({
        queryKey: ['admin-conversations'],
        queryFn: async () => {
            // Gracefully attempt to fetch conversations if the table exists
            const { data, error } = await supabase
                .from('conversations')
                .select(`
          id,
          updated_at,
          unread_count,
          participants:conversation_participants(user:profiles(id, name, role)),
          last_message:messages(id, text, created_at, read, sender_id)
        `)
                .order('updated_at', { ascending: false })
                .catch(() => ({ data: [], error: null })); // Fallback if table missing

            if (error || !data) return [];

            return data.map((conv: any) => ({
                id: conv.id,
                participants: conv.participants?.map((p: any) => p.user) || [],
                lastMessage: conv.last_message?.[0] || { text: "No messages yet", timestamp: conv.updated_at },
                unreadCount: conv.unread_count || 0,
                updatedAt: conv.updated_at,
            }));
        }
    });

    const staffAndClientsQuery = useQuery({
        queryKey: ['admin-message-recipients'],
        queryFn: async () => {
            const { data } = await supabase.from('profiles').select('id, name, role').in('role', ['client', 'staff']);
            return data || [];
        }
    });

    // These mutations are skeletons for when the db schema is fully ready
    const sendMessage = useMutation({
        mutationFn: async ({ conversationId, text }: { conversationId: string, text: string }) => {
            const { error } = await supabase.from('messages').insert({
                conversation_id: conversationId,
                text,
                sender_id: 'admin' // In a real app, this would be the actual admin user ID from auth
            });
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-conversations'] })
    });

    const createConversation = useMutation({
        mutationFn: async ({ recipientId, text }: { recipientId: string, text: string }) => {
            // Complex RPC or multi-insert required here normally
            throw new Error("Creating conversations requires backend RPC setup.");
        }
    });

    return {
        conversations: conversationsQuery.data || [],
        isLoading: conversationsQuery.isLoading,
        recipients: staffAndClientsQuery.data || [],
        sendMessage: sendMessage.mutateAsync,
        createConversation: createConversation.mutateAsync
    };
};
