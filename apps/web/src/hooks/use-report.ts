import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export function useReport() {
  return useMutation({
    mutationFn: (data: { postId: string; reason: string; details?: string }) =>
      apiClient.post('/reports', data),
  });
}
