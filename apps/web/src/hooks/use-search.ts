import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface SearchUser {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  creatorTokenAddress: string | null;
}

export function useUserSearch(query: string) {
  return useQuery<SearchUser[]>({
    queryKey: ['users', 'search', query],
    queryFn: async () => {
      const res = await apiClient.get('/users/search', { params: { q: query } });
      return res.data as SearchUser[];
    },
    enabled: query.trim().length >= 1,
    staleTime: 30_000,
  });
}

export function useDiscover() {
  return useQuery<SearchUser[]>({
    queryKey: ['users', 'discover'],
    queryFn: async () => {
      const res = await apiClient.get('/users/discover');
      return res.data as SearchUser[];
    },
    staleTime: 60_000,
  });
}
