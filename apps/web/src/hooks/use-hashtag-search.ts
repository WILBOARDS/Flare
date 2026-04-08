import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface HashtagResult {
  tag: string;
  postCount: number;
}

export function useHashtagSearch(query: string) {
  return useQuery<HashtagResult[]>({
    queryKey: ['hashtags', 'search', query],
    queryFn: async () => {
      const res = await apiClient.get('/hashtags/search', { params: { q: query } });
      return res.data as HashtagResult[];
    },
    enabled: query.trim().length > 0,
    staleTime: 30 * 1000,
  });
}
