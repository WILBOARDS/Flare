'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Send, Trash2, Loader2 } from 'lucide-react';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/use-comments';
import { useAuth } from '@/providers/auth-provider';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CommentSheetProps {
  postId: string;
  onClose: () => void;
}

export function CommentSheet({ postId, onClose }: CommentSheetProps) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: comments, isLoading } = useComments(postId);
  const { mutate: createComment, isPending: submitting } = useCreateComment(postId);
  const { mutate: deleteComment } = useDeleteComment(postId);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    createComment(text.trim(), {
      onSuccess: () => setText(''),
      onError: () => toast.error('Failed to post comment'),
    });
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#111] rounded-t-2xl flex flex-col max-h-[80vh]"
      >
        {/* Handle */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-neutral-800 flex-shrink-0">
          <h3 className="font-semibold text-sm">Comments</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-800 transition-colors">
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
            </div>
          ) : !comments?.length ? (
            <p className="text-center text-neutral-500 text-sm py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-700 overflow-hidden flex-shrink-0">
                  {comment.author.avatarUrl ? (
                    <Image
                      src={comment.author.avatarUrl}
                      alt={comment.author.displayName ?? ''}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-400">
                      {(comment.author.displayName ?? comment.author.username ?? '?')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">
                      {comment.author.displayName ?? comment.author.username}
                    </span>
                    <span className="text-xs text-neutral-500">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-neutral-200 mt-0.5 break-words">{comment.content}</p>
                </div>
                {user?.id === comment.authorId && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="p-1 text-neutral-600 hover:text-red-400 transition-colors flex-shrink-0"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input */}
        {user && (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 px-4 py-3 border-t border-neutral-800 flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-700 overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="You" width={32} height={32} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-400">
                  {(user.displayName ?? user.username ?? '?')[0].toUpperCase()}
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              maxLength={500}
              className="flex-1 bg-neutral-800 rounded-full px-4 py-2 text-sm outline-none placeholder-neutral-500 text-white"
            />
            <button
              type="submit"
              disabled={!text.trim() || submitting}
              className="p-2 rounded-full bg-brand text-white disabled:opacity-40 transition-opacity"
              aria-label="Post comment"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        )}
      </motion.div>
    </>
  );
}
