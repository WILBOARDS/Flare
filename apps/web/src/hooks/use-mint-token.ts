import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export function useMintToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; symbol: string }) =>
      apiClient.post('/tokens/mint', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}
