import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { FeedPage } from './use-feed';

export function usePostSearch(query: string) {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['posts', 'search', query],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = { q: query };
      if (pageParam) params.cursor = pageParam as string;
      const res = await apiClient.get('/posts/search', { params });
      return res.data as FeedPage;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: query.trim().length > 0,
  });
}
