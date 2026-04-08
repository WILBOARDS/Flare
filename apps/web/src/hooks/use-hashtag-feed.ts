import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { FeedPage } from './use-feed';

export function useHashtagFeed(tag: string) {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['hashtag', tag],
    queryFn: async ({ pageParam }) => {
      const params = pageParam ? { cursor: pageParam } : {};
      const res = await apiClient.get(`/hashtags/${tag}/feed`, { params });
      return res.data as FeedPage;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!tag,
  });
}
