import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export function useLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      liked
        ? apiClient.delete(`/posts/${postId}/like`)
        : apiClient.post(`/posts/${postId}/like`),
    onMutate: async ({ postId, liked }) => {
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
                ? { ...p, isLiked: !liked, likeCount: p.likeCount + (liked ? -1 : 1) }
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
