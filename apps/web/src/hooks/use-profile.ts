import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface Profile {
  id: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
  creatorTokenAddress?: string | null;
}

export function useProfile(username: string) {
  return useQuery<Profile>({
    queryKey: ['profile', username],
    queryFn: async () => {
      const res = await apiClient.get(`/users/${username}`);
      return res.data as Profile;
    },
    enabled: !!username,
  });
}

export function useFollow(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, following }: { userId: string; following: boolean }) =>
      following
        ? apiClient.delete(`/follows/${userId}`)
        : apiClient.post(`/follows/${userId}`),
    onMutate: async ({ following }) => {
      await queryClient.cancelQueries({ queryKey: ['profile', username] });
      const prev = queryClient.getQueryData<Profile>(['profile', username]);
      queryClient.setQueryData<Profile>(['profile', username], (old) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: !following,
          followerCount: old.followerCount + (following ? -1 : 1),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['profile', username], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
    },
  });
}
