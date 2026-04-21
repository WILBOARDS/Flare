import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface LeaderboardUser {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number;
  score: number;
}

export function useLeaderboard(period: 'all' | 'week' = 'all') {
  return useQuery<LeaderboardUser[]>({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const res = await apiClient.get('/users/leaderboard', { params: { period } });
      return res.data as LeaderboardUser[];
    },
    staleTime: 2 * 60 * 1000,
  });
}
