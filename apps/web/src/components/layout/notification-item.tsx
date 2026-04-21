import Image from 'next/image';
import { Heart, MessageCircle, UserPlus } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { Notification } from '@/hooks/use-notifications';

const ICONS = {
  like: <Heart className="w-3.5 h-3.5 text-red-400" fill="currentColor" />,
  comment: <MessageCircle className="w-3.5 h-3.5 text-brand" />,
  follow: <UserPlus className="w-3.5 h-3.5 text-green-400" />,
};

const MESSAGES = {
  like: 'liked your post',
  comment: 'commented on your post',
  follow: 'started following you',
};

export function NotificationItem({ notification }: { notification: Notification }) {
  const actor = notification.actor;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${notification.read ? '' : 'bg-brand/5'}`}>
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-neutral-700 overflow-hidden">
          {actor.avatarUrl ? (
            <Image src={actor.avatarUrl} alt={actor.displayName ?? ''} width={36} height={36} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-neutral-400">
              {(actor.displayName ?? actor.username ?? '?')[0].toUpperCase()}
            </div>
          )}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-neutral-900 flex items-center justify-center">
          {ICONS[notification.type]}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">
          <span className="font-semibold">{actor.displayName ?? actor.username}</span>{' '}
          {MESSAGES[notification.type]}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">{timeAgo(notification.createdAt)}</p>
      </div>
    </div>
  );
}
