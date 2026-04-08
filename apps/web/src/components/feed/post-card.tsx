'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Bookmark, Eye, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCount, timeAgo } from '@/lib/utils';
import { useLike } from '@/hooks/use-like';
import { useBookmark } from '@/hooks/use-bookmark';
import { useAuth } from '@/providers/auth-provider';
import { CommentSheet } from './comment-sheet';
import { ViewTracker } from './view-tracker';
import { RichContent } from './rich-content';
import { TokenGatedOverlay } from './token-gated-overlay';
import { ReportModal } from './report-modal';
import type { Post } from '@/hooks/use-feed';

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const { mutate: toggleLike, isPending: likePending } = useLike();
  const { mutate: toggleBookmark, isPending: bookmarkPending } = useBookmark();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleLike = () => {
    if (!user) return;
    toggleLike({ postId: post.id, liked: post.isLiked });
  };

  const handleBookmark = () => {
    if (!user) return;
    toggleBookmark({ postId: post.id, isBookmarked: post.isBookmarked });
  };

  return (
    <ViewTracker postId={post.id}>
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4 mb-3 relative"
      >
        {post.isTokenGated && !post.hasAccess && <TokenGatedOverlay />}

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
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="text-neutral-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-7 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-20 py-1 min-w-[130px]">
                  <button
                    onClick={() => { setShowMenu(false); setShowReport(true); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-neutral-800 transition-colors"
                  >
                    Report post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <RichContent content={post.content} />

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

        {/* Actions */}
        <div className="flex items-center gap-5 pt-1">
          <button
            onClick={handleLike}
            disabled={likePending || !user}
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
          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            aria-label={`${post.commentCount ?? 0} comments`}
          >
            <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            {(post.commentCount ?? 0) > 0 && (
              <span>{formatCount(post.commentCount)}</span>
            )}
          </button>
          {(post.viewCount ?? 0) > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-neutral-600">
              <Eye className="w-4 h-4" strokeWidth={1.5} />
              <span>{formatCount(post.viewCount ?? 0)}</span>
            </span>
          )}
          <button
            onClick={handleBookmark}
            disabled={bookmarkPending || !user}
            className={cn(
              'ml-auto flex items-center gap-1.5 text-sm transition-colors',
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

        <AnimatePresence>
          {showComments && (
            <CommentSheet postId={post.id} onClose={() => setShowComments(false)} />
          )}
        </AnimatePresence>
      </motion.article>

      <AnimatePresence>
        {showReport && (
          <ReportModal postId={post.id} onClose={() => setShowReport(false)} />
        )}
      </AnimatePresence>
    </ViewTracker>
  );
}
