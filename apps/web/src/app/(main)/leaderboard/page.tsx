'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy, Medal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLeaderboard } from '@/hooks/use-leaderboard';
import { formatCount } from '@/lib/utils';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'all' | 'week'>('all');
  const { data, isLoading } = useLeaderboard(period);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Trophy className="w-6 h-6 text-brand" />
        <h1 className="text-2xl font-black text-white">Leaderboard</h1>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 mb-5">
        {(['all', 'week'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              period === p
                ? 'bg-brand text-white'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {p === 'all' ? 'All Time' : 'This Week'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse card p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-800" />
              <div className="w-10 h-10 rounded-full bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-800 rounded w-32" />
                <div className="h-3 bg-neutral-800 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.map((creator, index) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link href={`/profile/${creator.username}`}>
                <div className="card p-4 flex items-center gap-3 hover:border-neutral-700 transition-colors">
                  {/* Rank */}
                  <div className="w-8 text-center flex-shrink-0">
                    {index === 0 ? (
                      <Trophy className="w-5 h-5 text-yellow-400 mx-auto" />
                    ) : index === 1 ? (
                      <Medal className="w-5 h-5 text-neutral-300 mx-auto" />
                    ) : index === 2 ? (
                      <Medal className="w-5 h-5 text-orange-600 mx-auto" />
                    ) : (
                      <span className="text-sm font-bold text-neutral-500">#{index + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-neutral-700 overflow-hidden flex-shrink-0">
                    {creator.avatarUrl ? (
                      <Image
                        src={creator.avatarUrl}
                        alt={creator.displayName ?? ''}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400">
                        {(creator.displayName ?? creator.username ?? '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">
                      {creator.displayName ?? creator.username}
                    </p>
                    <p className="text-xs text-neutral-500">
                      @{creator.username} · {formatCount(creator.followerCount)} followers
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-brand">{formatCount(creator.score)}</p>
                    <p className="text-[10px] text-neutral-600">pts</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
