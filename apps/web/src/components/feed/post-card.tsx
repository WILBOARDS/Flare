'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Bookmark, Repeat2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatCount, timeAgo } from '@/lib/utils';
import { useLike } from '@/hooks/use-like';
import { useBookmark } from '@/hooks/use-bookmark';
import { useRepost } from '@/hooks/use-repost';
import { useAuth } from '@/providers/auth-provider';
import { PostActionsMenu } from '@/components/feed/post-actions-menu';
import type { Post } from '@/hooks/use-feed';

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const { mutate: toggleLike, isPending: isLikePending } = useLike();
  const { mutate: toggleBookmark, isPending: isBookmarkPending } = useBookmark();
  const { mutate: toggleRepost, isPending: isRepostPending } = useRepost();

  const handleLike = () => {
    if (!user) return;
    toggleLike({ postId: post.id, liked: post.isLiked });
  };

  const handleBookmark = () => {
    if (!user) return;
    toggleBookmark({ postId: post.id, bookmarked: post.isBookmarked ?? false });
  };

  const handleRepost = () => {
    if (!user) return;
    toggleRepost({ postId: post.id, reposted: post.isReposted ?? false });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 mb-3"
    >
      {/* Author */}
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/profile/${post.author.username}`}>
          <div className="w-10 h-10 rounded-full bg-neutral-700 overflow-hidden flex-shrink-0">
            {post.author.avatarUrl ? (
              <Image
                src={post.author.avatarUrl}
                alt={post.author.displayName ?? ''}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">
                {(post.author.displayName ?? post.author.username ?? '?')[0].toUpperCase()}
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${post.author.username}`} className="hover:underline">
            <p className="font-semibold text-sm truncate">
              {post.author.displayName ?? post.author.username}
            </p>
          </Link>
          <p className="text-neutral-500 text-xs">@{post.author.username} · {timeAgo(post.createdAt)}</p>
        </div>
        {user?.id === post.authorId && <PostActionsMenu post={post} />}
      </div>

      {/* Content — clickable body navigates to permalink */}
      <Link href={`/post/${post.id}`} className="block group">
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-3 group-hover:opacity-90 transition-opacity">
          {post.content}
        </p>

        {/* Image */}
        {post.imageUrl && (
          <div className="rounded-xl overflow-hidden mb-3 bg-neutral-800">
            <Image
              src={post.imageUrl}
              alt="Post image"
              width={600}
              height={400}
              className="w-full object-cover max-h-80"
            />
          </div>
        )}
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-5 pt-1">
        <button
          onClick={handleLike}
          disabled={isLikePending || !user}
          className={cn(
            'flex items-center gap-1.5 text-sm transition-colors',
            post.isLiked ? 'text-red-400' : 'text-neutral-500 hover:text-red-400',
          )}
        >
          <Heart
            className="w-5 h-5"
            fill={post.isLiked ? 'currentColor' : 'none'}
            strokeWidth={1.5}
          />
          <span>{formatCount(post.likeCount)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
          <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <button
          onClick={handleRepost}
          disabled={isRepostPending || !user}
          className={cn(
            'flex items-center gap-1.5 text-sm transition-colors',
            post.isReposted ? 'text-green-400' : 'text-neutral-500 hover:text-green-400',
          )}
        >
          <Repeat2 className="w-5 h-5" strokeWidth={1.5} />
          {post.repostCount !== undefined && post.repostCount > 0 && (
            <span>{formatCount(post.repostCount)}</span>
          )}
        </button>
        <button
          onClick={handleBookmark}
          disabled={isBookmarkPending || !user}
          className={cn(
            'flex items-center gap-1.5 text-sm transition-colors ml-auto',
            post.isBookmarked ? 'text-brand' : 'text-neutral-500 hover:text-brand',
          )}
        >
          <Bookmark
            className="w-5 h-5"
            fill={post.isBookmarked ? 'currentColor' : 'none'}
            strokeWidth={1.5}
          />
        </button>
      </div>
    </motion.article>
  );
}
