import { Lock } from 'lucide-react';

export function TokenGatedOverlay() {
  return (
    <div className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-2 z-10">
      <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
        <Lock className="w-5 h-5 text-brand" />
      </div>
      <p className="text-sm font-semibold text-white">Token Gated</p>
      <p className="text-xs text-neutral-400 text-center px-4">Hold the creator token to unlock this post</p>
    </div>
  );
}
