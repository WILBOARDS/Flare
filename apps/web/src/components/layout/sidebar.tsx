'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Wallet, User, Trophy, PlusSquare } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/feed', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/create', icon: PlusSquare, label: 'Create' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-[#0A0A0A] border-r border-neutral-800 z-40 py-6 px-4">
      {/* Logo */}
      <Link href="/feed" className="text-2xl font-black text-brand mb-8 px-2 block">
        FLAIR
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-brand/10 text-brand'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5',
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
        {user?.username && (
          <Link
            href={`/profile/${user.username}`}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
              pathname.startsWith('/profile')
                ? 'bg-brand/10 text-brand'
                : 'text-neutral-400 hover:text-white hover:bg-white/5',
            )}
          >
            <User className="w-5 h-5" />
            Profile
          </Link>
        )}
      </nav>

      {/* User info */}
      {user && (
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-8 h-8 rounded-full bg-neutral-700 overflow-hidden flex-shrink-0">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.displayName ?? ''} width={32} height={32} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-400">
                {(user.displayName ?? user.username ?? '?')[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.displayName ?? user.username}</p>
            <p className="text-[11px] text-neutral-500 truncate">@{user.username}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
