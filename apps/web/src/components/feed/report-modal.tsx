'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useReport } from '@/hooks/use-report';
import toast from 'react-hot-toast';

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
];

export function ReportModal({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const { mutate: report, isPending } = useReport();

  const handleSubmit = () => {
    if (!reason) return;
    report(
      { postId, reason },
      {
        onSuccess: () => { toast.success('Report submitted'); onClose(); },
        onError: () => toast.error('Failed to submit report'),
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-neutral-900 rounded-2xl w-full max-w-sm p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Report Post</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-2 mb-4">
          {REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setReason(r.value)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                reason === r.value
                  ? 'bg-brand/20 text-brand border border-brand/40'
                  : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-transparent'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!reason || isPending}
          className="btn-primary w-full disabled:opacity-50"
        >
          {isPending ? 'Submitting...' : 'Submit Report'}
        </button>
      </motion.div>
    </motion.div>
  );
}
