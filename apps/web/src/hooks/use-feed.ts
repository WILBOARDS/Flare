import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  viewCount?: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isTokenGated?: boolean;
  hasAccess?: boolean;
  createdAt: string;
  author: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface FeedPage {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}

export function useFeed(options?: { enabled?: boolean }) {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => {
      const params = pageParam ? { cursor: pageParam } : {};
      const res = await apiClient.get('/feed', { params });
      return res.data as FeedPage;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: options?.enabled ?? true,
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

export function useTrendingFeed(options?: { enabled?: boolean }) {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['feed', 'trending'],
    queryFn: async ({ pageParam }) => {
      const params = pageParam ? { cursor: pageParam } : {};
      const res = await apiClient.get('/feed/trending', { params });
      return res.data as FeedPage;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: options?.enabled ?? true,
  });
}

export function useUserLikedFeed(username: string, options?: { enabled?: boolean }) {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['feed', 'user', username, 'liked'],
    queryFn: async ({ pageParam }) => {
      const params = pageParam ? { cursor: pageParam } : {};
      const res = await apiClient.get(`/feed/user/${username}/liked`, { params });
      return res.data as FeedPage;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!username && (options?.enabled ?? true),
  });
}
