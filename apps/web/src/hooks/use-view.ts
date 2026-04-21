import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export function useRecordView() {
  return useMutation({
    mutationFn: ({ postId }: { postId: string }) =>
      apiClient.post(`/posts/${postId}/view`),
  });
}
