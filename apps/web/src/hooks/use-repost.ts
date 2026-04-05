import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export function useRepost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, reposted }: { postId: string; reposted: boolean }) =>
      reposted
        ? apiClient.delete(`/posts/${postId}/repost`)
        : apiClient.post(`/posts/${postId}/repost`),
    onMutate: async ({ postId, reposted }) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      // Optimistic update across all feed pages
      queryClient.setQueriesData({ queryKey: ['feed'] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) =>
              p.id === postId
                ? {
                    ...p,
                    isReposted: !reposted,
                    repostCount: (p.repostCount ?? 0) + (reposted ? -1 : 1),
                  }
                : p,
            ),
          })),
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
