'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useFeed, useTrendingFeed } from '@/hooks/use-feed';
import { PostCard } from '@/components/feed/post-card';
import { PostSkeleton } from '@/components/feed/post-skeleton';

type Tab = 'for-you' | 'trending';

function FeedTabContent({ tab }: { tab: Tab }) {
  const forYou = useFeed();
  const trending = useTrendingFeed();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    tab === 'for-you' ? forYou : trending;

  const loaderRef = useRef<HTMLDivElement>(null);

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

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  if (isLoading) {
    return <>{Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)}</>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-500">
        <p className="text-lg font-medium">Nothing here yet</p>
        <p className="text-sm mt-1">
          {tab === 'for-you' ? 'Create a post to get started' : 'No trending posts in the last 7 days'}
        </p>
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => <PostCard key={post.id} post={post} />)}
      <div ref={loaderRef} className="h-10" />
      {isFetchingNextPage && <PostSkeleton />}
    </>
  );
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<Tab>('for-you');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'for-you', label: 'For You' },
    { id: 'trending', label: 'Trending' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-brand">FLAIR</h1>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-neutral-800 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative px-5 py-3 text-sm font-semibold transition-colors focus:outline-none"
            style={{ color: activeTab === tab.id ? '#FF6B35' : undefined }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: '#FF6B35' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Feed */}
      <FeedTabContent tab={activeTab} />
    </div>
  );
}
