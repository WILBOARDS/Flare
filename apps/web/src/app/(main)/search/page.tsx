'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, UserPlus, UserMinus, Loader2, Sparkles, Hash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useUserSearch, useDiscover, type SearchUser } from '@/hooks/use-search';
import { useAuth } from '@/providers/auth-provider';
import apiClient from '@/lib/api-client';
import { formatCount } from '@/lib/utils';
import { usePostSearch } from '@/hooks/use-post-search';
import { useHashtagSearch } from '@/hooks/use-hashtag-search';
import { PostCard } from '@/components/feed/post-card';

function UserCard({ user, onFollowChange }: { user: SearchUser; onFollowChange?: () => void }) {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isOwnProfile = currentUser?.id === user.id;

  const followMutation = useMutation({
    mutationFn: () =>
      user.isFollowing
        ? apiClient.delete(`/follows/${user.id}`)
        : apiClient.post(`/follows/${user.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onFollowChange?.();
    },
    onError: () => toast.error('Failed to update follow'),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
    >
      <Link href={`/profile/${user.username}`} className="flex-shrink-0">
        <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-brand to-orange-400 flex items-center justify-center">
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.displayName ?? ''} fill className="object-cover" />
          ) : (
            <span className="text-base font-bold text-white">
              {(user.displayName || user.username || '?')[0].toUpperCase()}
            </span>
          )}
        </div>
      </Link>

      <Link href={`/profile/${user.username}`} className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate">
          {user.displayName || user.username}
        </p>
        <p className="text-neutral-500 text-xs truncate">@{user.username}</p>
        <p className="text-neutral-600 text-xs mt-0.5">
          {formatCount(user.followerCount)} followers
        </p>
      </Link>

      {!isOwnProfile && currentUser && (
        <button
          onClick={() => followMutation.mutate()}
          disabled={followMutation.isPending}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex-shrink-0 ${
            user.isFollowing
              ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
              : 'bg-brand hover:bg-brand-600 text-white'
          }`}
        >
          {followMutation.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : user.isFollowing ? (
            <><UserMinus className="w-3 h-3" /> Following</>
          ) : (
            <><UserPlus className="w-3 h-3" /> Follow</>
          )}
        </button>
      )}
    </motion.div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchTab, setSearchTab] = useState<'users' | 'posts' | 'hashtags'>('users');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isFetching: searching } = useUserSearch(debouncedQuery);
  const { data: postResults, isFetching: postSearching } = usePostSearch(debouncedQuery);
  const { data: hashtagResults, isFetching: hashtagSearching } = useHashtagSearch(debouncedQuery);
  const { data: discover, isLoading: discoverLoading } = useDiscover();

  const showSearch = debouncedQuery.trim().length > 0;
  const postPages = postResults?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Search bar */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-sm px-4 py-3 border-b border-neutral-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            ref={inputRef}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
            placeholder="Search creators..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showSearch ? (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Search type tabs */}
            <div className="flex border-b border-neutral-800">
              {(['users', 'posts', 'hashtags'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSearchTab(t)}
                  className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                    searchTab === t
                      ? 'text-white border-b-2 border-brand'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {t === 'users' ? 'Users' : t === 'posts' ? 'Posts' : 'Tags'}
                </button>
              ))}
            </div>

            {searchTab === 'users' && (
              searching ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
                </div>
              ) : searchResults?.length === 0 ? (
                <div className="text-center py-16 text-neutral-500">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No users found for &ldquo;{debouncedQuery}&rdquo;</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-900">
                  {searchResults?.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )
            )}

            {searchTab === 'posts' && (
              postSearching ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
                </div>
              ) : postPages.length === 0 ? (
                <div className="text-center py-16 text-neutral-500">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No posts found for &ldquo;{debouncedQuery}&rdquo;</p>
                </div>
              ) : (
                <div className="pt-2">
                  {postPages.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )
            )}

            {searchTab === 'hashtags' && (
              hashtagSearching ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
                </div>
              ) : !hashtagResults?.length ? (
                <div className="text-center py-16 text-neutral-500">
                  <Hash className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hashtags found for &ldquo;{debouncedQuery}&rdquo;</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-900">
                  {hashtagResults.map((tag) => (
                    <Link
                      key={tag.tag}
                      href={`/hashtag/${tag.tag}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-sm text-white">
                        <Hash className="w-4 h-4 text-brand" />
                        {tag.tag}
                      </span>
                      <span className="text-xs text-neutral-500">{tag.postCount} posts</span>
                    </Link>
                  ))}
                </div>
              )
            )}
          </motion.div>
        ) : (
          <motion.div
            key="discover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Discover header */}
            <div className="px-4 pt-5 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <h2 className="font-bold text-sm text-white">Suggested for you</h2>
            </div>

            {discoverLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
              </div>
            ) : (
              <div className="divide-y divide-neutral-900">
                {discover?.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
