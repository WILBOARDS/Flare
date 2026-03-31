import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export function useFLCBalance(address: string | undefined) {
  return useQuery<{ address: string; balance: string; symbol: string; decimals: number }>({
    queryKey: ['flc-balance', address],
    queryFn: async () => {
      const res = await apiClient.get(`/tokens/flc/balance/${address}`);
      return res.data;
    },
    enabled: !!address,
    refetchInterval: 30_000, // refresh every 30s
  });
}
