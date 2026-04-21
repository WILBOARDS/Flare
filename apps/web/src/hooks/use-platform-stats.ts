import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface PlatformStats {
  totalUsers: number;
  totalPosts: number;
  totalCreatorTokens: number;
}

export function usePlatformStats() {
  return useQuery<PlatformStats>({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/stats');
      return res.data as PlatformStats;
    },
    staleTime: 5 * 60 * 1000,
  });
}
