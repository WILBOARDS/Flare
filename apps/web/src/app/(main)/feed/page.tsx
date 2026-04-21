'use client';

import { useState, useEffect, useRef } from 'react';
import { useFeed, useTrendingFeed } from '@/hooks/use-feed';
import { PostCard } from '@/components/feed/post-card';
import { PostSkeleton } from '@/components/feed/post-skeleton';
import { NotificationBell } from '@/components/layout/notification-bell';

type Tab = 'foryou' | 'trending';

export default function FeedPage() {
  const [tab, setTab] = useState<Tab>('foryou');
  const loaderRef = useRef<HTMLDivElement>(null);

  const forYou = useFeed({ enabled: tab === 'foryou' });
  const trending = useTrendingFeed({ enabled: tab === 'trending' });

  const active = tab === 'foryou' ? forYou : trending;
  const { fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = active;

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

  const posts = active.data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-brand">FLAIR</h1>
        <NotificationBell />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 mb-4">
        {(['foryou', 'trending'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === t
                ? 'text-white border-b-2 border-brand'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {t === 'foryou' ? 'For You' : 'Trending'}
          </button>
        ))}
      </div>

      {/* Feed */}
      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          <p className="text-lg font-medium">Nothing here yet</p>
          <p className="text-sm mt-1">Create a post to get started</p>
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}

      <div ref={loaderRef} className="h-10" />
      {isFetchingNextPage && <PostSkeleton />}
    </div>
  );
}
