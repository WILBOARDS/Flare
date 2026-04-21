'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, User, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';

const navItems = [
  { href: '/feed', icon: Home, label: 'Feed' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/create', icon: PlusSquare, label: 'Create' },
  { href: '/leaderboard', icon: Trophy, label: 'Top' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className={cn('fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur border-t border-neutral-800 z-50', className)}>
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const resolvedHref = href === '/profile' && user?.username
            ? `/profile/${user.username}`
            : href;
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={resolvedHref}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                isActive ? 'text-brand' : 'text-neutral-500 hover:text-neutral-300',
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
