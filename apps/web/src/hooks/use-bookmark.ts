import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { FeedPage } from './use-feed';

export function useBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isBookmarked }: { postId: string; isBookmarked: boolean }) =>
      isBookmarked
        ? apiClient.delete(`/bookmarks/${postId}`)
        : apiClient.post(`/bookmarks/${postId}`),
    onMutate: async ({ postId, isBookmarked }) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const snapshot = queryClient.getQueriesData({ queryKey: ['feed'] });
      queryClient.setQueriesData({ queryKey: ['feed'] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) =>
              p.id === postId ? { ...p, isBookmarked: !isBookmarked } : p,
            ),
          })),
        };
      });
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        for (const [queryKey, data] of context.snapshot) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['saved-feed'] });
    },
  });
}

export function useSavedFeed() {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['saved-feed'],
    queryFn: async ({ pageParam }) => {
      const params = pageParam ? { cursor: pageParam } : {};
      const res = await apiClient.get('/bookmarks', { params });
      return res.data as FeedPage;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
}
