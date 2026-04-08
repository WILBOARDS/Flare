import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  read: boolean;
  createdAt: string;
  actor: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
  postId: string | null;
}

interface NotificationsPage {
  notifications: Notification[];
  nextCursor?: string;
  hasMore: boolean;
  unreadCount: number;
}

export function useNotifications() {
  return useInfiniteQuery<NotificationsPage>({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam }) => {
      const params = pageParam ? { cursor: pageParam } : {};
      const res = await apiClient.get('/notifications', { params });
      return res.data as NotificationsPage;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}


export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
