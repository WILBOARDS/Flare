'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, UserPlus, UserMinus, Coins, ExternalLink, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProfile, useFollow } from '@/hooks/use-profile';
import { useUserFeed, useUserLikedFeed } from '@/hooks/use-feed';
import { useSavedFeed } from '@/hooks/use-bookmark';
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

  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'saved'>('posts');
  const isOwnProfile = user?.id === profile?.id;

  const { data: likedData, isLoading: likedLoading } = useUserLikedFeed(username, { enabled: activeTab === 'liked' });
  const { data: savedData, isLoading: savedLoading } = useSavedFeed({ enabled: activeTab === 'saved' && isOwnProfile });

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];
  const likedPosts = likedData?.pages.flatMap((p) => p.posts) ?? [];
  const savedPosts = savedData?.pages.flatMap((p) => p.posts) ?? [];

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
        <div className="flex gap-6 mb-4 pb-4 border-b border-neutral-800">
          <div>
            <span className="font-bold">{formatCount(profile.followingCount)}</span>
            <span className="text-neutral-500 text-sm ml-1">Following</span>
          </div>
          <div>
            <span className="font-bold">{formatCount(profile.followerCount)}</span>
            <span className="text-neutral-500 text-sm ml-1">Followers</span>
          </div>
        </div>

        {/* Creator Token */}
        {profile.creatorTokenAddress ? (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-brand/10 to-orange-900/10 border border-brand/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-brand" />
                <span className="text-sm font-semibold text-brand">Creator Token</span>
              </div>
              <a
                href={`https://amoy.polygonscan.com/token/${profile.creatorTokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
                aria-label="View on PolygonScan"
              >
                View on PolygonScan
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="mt-2 text-xs font-mono text-neutral-400 truncate">
              {profile.creatorTokenAddress}
            </p>
          </div>
        ) : isOwnProfile ? (
          <div className="mb-4 p-4 rounded-xl border border-dashed border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                <Rocket className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-300">Launch your Creator Token</p>
                <p className="text-xs text-neutral-500 mt-0.5">Let fans invest in your content and earn together</p>
              </div>
              <button
                onClick={() => router.push('/settings')}
                className="text-xs font-semibold text-brand hover:text-orange-400 transition-colors flex-shrink-0"
              >
                Coming Soon
              </button>
            </div>
          </div>
        ) : null}

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 mb-4">
          {(['posts', 'liked', 'saved'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
                activeTab === t
                  ? 'text-white border-b-2 border-brand'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {t === 'posts' ? 'Posts' : t === 'liked' ? 'Liked' : 'Saved'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'posts' && (
          <>
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
          </>
        )}

        {activeTab === 'liked' && (
          <>
            {likedLoading ? (
              Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
            ) : likedPosts.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <p className="text-sm">No liked posts yet</p>
              </div>
            ) : (
              likedPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <>
            {!isOwnProfile ? (
              <div className="text-center py-12 text-neutral-500">
                <p className="text-sm">Saved posts are private</p>
              </div>
            ) : savedLoading ? (
              Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
            ) : savedPosts.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <p className="text-sm">No saved posts yet</p>
              </div>
            ) : (
              savedPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
