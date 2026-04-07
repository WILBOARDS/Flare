'use client';

import { useEffect, useRef } from 'react';
import { useFeed } from '@/hooks/use-feed';
import { PostCard } from '@/components/feed/post-card';
import { PostSkeleton } from '@/components/feed/post-skeleton';

export default function FeedPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed();
  const loaderRef = useRef<HTMLDivElement>(null);

  // Infinite scroll via IntersectionObserver
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black text-brand">FLAIR</h1>
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

      {/* Infinite scroll trigger */}
      <div ref={loaderRef} className="h-10" />
      {isFetchingNextPage && <PostSkeleton />}
    </div>
  );
}
