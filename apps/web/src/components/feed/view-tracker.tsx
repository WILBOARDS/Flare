'use client';
import { useEffect, useRef } from 'react';
import { useRecordView } from '@/hooks/use-view';

export function ViewTracker({ postId, children }: { postId: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const hasTracked = useRef(false);
  const { mutate: recordView } = useRecordView();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasTracked.current) {
          timer = setTimeout(() => {
            hasTracked.current = true;
            recordView({ postId });
          }, 1000);
        } else if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer !== null) clearTimeout(timer);
    };
  }, [postId, recordView]);

  return <div ref={ref}>{children}</div>;
}
