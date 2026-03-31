'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, UserPlus, UserMinus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProfile, useFollow } from '@/hooks/use-profile';
import { useUserFeed } from '@/hooks/use-feed';
import { useAuth } from '@/providers/auth-provider';
import { PostCard } from '@/components/feed/post-card';
import { PostSkeleton } from '@/components/feed/post-skeleton';
import { formatCount } from '@/lib/utils';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data: profile, isLoading: profileLoading } = useProfile(username);
  const { mutate: toggleFollow, isPending: followPending } = useFollow(username);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: feedLoading,
  } = useUserFeed(username);

  const isOwnProfile = user?.id === profile?.id;
  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  // Infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleFollow = () => {
    if (!profile || !user) return;
    toggleFollow({ userId: profile.id, following: !!profile.isFollowing });
  };

  if (profileLoading) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-neutral-800" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-neutral-800 rounded w-32" />
              <div className="h-4 bg-neutral-800 rounded w-24" />
            </div>
          </div>
          <div className="h-4 bg-neutral-800 rounded w-3/4" />
          <div className="flex gap-6">
            <div className="h-4 bg-neutral-800 rounded w-20" />
            <div className="h-4 bg-neutral-800 rounded w-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-neutral-500">
        <p className="text-lg font-medium">User not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg truncate">
          {profile.displayName ?? profile.username}
        </h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile info */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-20 h-20 rounded-full bg-neutral-700 overflow-hidden flex-shrink-0">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName ?? ''}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-neutral-400">
                {(profile.displayName ?? profile.username ?? '?')[0].toUpperCase()}
              </div>
            )}
          </div>

          {!isOwnProfile && user && (
            <button
              onClick={handleFollow}
              disabled={followPending}
              className={
                profile.isFollowing
                  ? 'btn-ghost flex items-center gap-2 text-sm py-2 px-4'
                  : 'btn-primary flex items-center gap-2 text-sm py-2 px-4'
              }
            >
              {profile.isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Follow
                </>
              )}
            </button>
          )}

          {isOwnProfile && (
            <button
              onClick={() => router.push('/settings')}
              className="btn-ghost text-sm py-2 px-4"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="mb-3">
          <p className="font-bold text-lg">{profile.displayName ?? profile.username}</p>
          <p className="text-neutral-500 text-sm">@{profile.username}</p>
        </div>

        {profile.bio && (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-4">
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-6 mb-6 pb-6 border-b border-neutral-800">
          <div>
            <span className="font-bold">{formatCount(profile.followingCount)}</span>
            <span className="text-neutral-500 text-sm ml-1">Following</span>
          </div>
          <div>
            <span className="font-bold">{formatCount(profile.followerCount)}</span>
            <span className="text-neutral-500 text-sm ml-1">Followers</span>
          </div>
        </div>

        {/* Posts */}
        {feedLoading ? (
          Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <p className="text-sm">No posts yet</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}

        <div ref={loaderRef} className="h-10" />
        {isFetchingNextPage && <PostSkeleton />}
      </motion.div>
    </div>
  );
}
