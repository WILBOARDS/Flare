import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  author: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface FeedPage {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}

export function useFeed() {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => {
      const params = pageParam ? { cursor: pageParam } : {};
      const res = await apiClient.get('/feed', { params });
      return res.data as FeedPage;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}

export function useUserFeed(username: string) {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['feed', 'user', username],
    queryFn: async ({ pageParam }) => {
      const params = pageParam ? { cursor: pageParam } : {};
      const res = await apiClient.get(`/feed/user/${username}`, { params });
      return res.data as FeedPage;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!username,
  });
}
