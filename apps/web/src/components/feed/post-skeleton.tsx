export function PostSkeleton() {
  return (
    <div className="card p-4 mb-3 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-neutral-800" />
        <div className="flex-1">
          <div className="h-3.5 bg-neutral-800 rounded w-28 mb-1.5" />
          <div className="h-3 bg-neutral-800 rounded w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-neutral-800 rounded w-full" />
        <div className="h-4 bg-neutral-800 rounded w-4/5" />
        <div className="h-4 bg-neutral-800 rounded w-2/3" />
      </div>
    </div>
  );
}
