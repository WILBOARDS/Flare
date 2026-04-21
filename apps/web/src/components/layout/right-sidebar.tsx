'use client';

import Link from 'next/link';
import { Hash, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface TrendingTag {
  tag: string;
  postCount: number;
}

function useTrendingHashtags() {
  return useQuery<TrendingTag[]>({
    queryKey: ['hashtags', 'trending'],
    queryFn: async () => {
      const res = await apiClient.get('/hashtags/trending');
      return res.data as TrendingTag[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function RightSidebar() {
  const { data: tags, isLoading } = useTrendingHashtags();

  return (
    <aside className="hidden lg:block fixed right-0 top-0 h-full w-80 border-l border-neutral-800 py-6 px-4 overflow-y-auto">
      <div className="bg-neutral-900/50 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-brand" />
          <h3 className="font-bold text-sm text-white">Trending</h3>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-4 bg-neutral-800 rounded w-3/4" />
            ))}
          </div>
        ) : tags?.length === 0 ? (
          <p className="text-xs text-neutral-500">No trending topics yet</p>
        ) : (
          <div className="space-y-2">
            {tags?.slice(0, 8).map((tag) => (
              <Link
                key={tag.tag}
                href={`/hashtag/${tag.tag}`}
                className="flex items-center justify-between group"
              >
                <span className="flex items-center gap-1.5 text-sm text-neutral-300 group-hover:text-brand transition-colors">
                  <Hash className="w-3.5 h-3.5" />
                  {tag.tag}
                </span>
                <span className="text-xs text-neutral-600">{tag.postCount}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
