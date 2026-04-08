'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, RefreshCw, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/providers/auth-provider';
import { useFLCBalance } from '@/hooks/use-flc-balance';
import { useMintToken } from '@/hooks/use-mint-token';

function MintTokenCard() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const { mutate: mint, isPending } = useMintToken();

  const handleMint = () => {
    if (!name.trim() || !symbol.trim()) return;
    mint(
      { name: name.trim(), symbol: symbol.trim().toUpperCase() },
      {
        onSuccess: () => toast.success('Creator token launched!'),
        onError: () => toast.error('Failed to launch token'),
      },
    );
  };

  return (
    <div className="card p-5">
      <h3 className="font-bold text-white mb-1">Launch Creator Token</h3>
      <p className="text-xs text-neutral-500 mb-4">Deploy your own ERC-20 token on Polygon Amoy</p>
      <div className="space-y-3">
        <input
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
          placeholder="Token name (e.g. My Creator Token)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
          placeholder="Symbol (e.g. MCT)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          maxLength={10}
        />
        <button
          onClick={handleMint}
          disabled={isPending || !name.trim() || !symbol.trim()}
          className="w-full bg-brand hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {isPending ? 'Launching...' : 'Launch Token'}
        </button>
      </div>
    </div>
  );
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletPage() {
  const { user } = useAuth();
  const walletAddress = user?.walletAddress;

  const {
    data: flcData,
    isLoading,
    refetch,
    isFetching,
  } = useFLCBalance(walletAddress ?? undefined);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-brand">Wallet</h1>
        {walletAddress && (
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {!walletAddress ? (
        <div className="card p-6 text-center text-neutral-500">
          <Coins className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No wallet connected</p>
          <p className="text-sm mt-1">Complete onboarding to get your wallet</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Wallet address card */}
          <div className="card p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Wallet Address</p>
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm text-white">{truncateAddress(walletAddress)}</p>
              <a
                href={`https://polygonscan.com/address/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-brand transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* FLC Balance card */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="font-semibold">FLAIR Coin</p>
                <p className="text-xs text-neutral-500">FLC · Polygon</p>
              </div>
            </div>

            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-9 bg-neutral-800 rounded w-40 mb-1" />
                <div className="h-4 bg-neutral-800 rounded w-24" />
              </div>
            ) : flcData ? (
              <div>
                <p className="text-3xl font-black text-white">
                  {parseFloat(flcData.balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </p>
                <p className="text-sm text-neutral-500 mt-1">{flcData.symbol}</p>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-black text-white">0.00</p>
                <p className="text-sm text-neutral-500 mt-1">FLC</p>
              </div>
            )}
          </div>

          {/* Creator Token */}
          {user.creatorTokenAddress ? (
            <div className="card p-4">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Your Creator Token</p>
              <p className="font-mono text-sm text-white truncate">{user.creatorTokenAddress}</p>
              <a
                href={`https://amoy.polygonscan.com/token/${user.creatorTokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand hover:text-orange-400 transition-colors mt-2"
              >
                View on PolygonScan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <MintTokenCard />
          )}

          {/* Info note */}
          <div className="card p-4 border-neutral-800">
            <p className="text-xs text-neutral-500 leading-relaxed">
              Your FLC balance updates automatically every 30 seconds. FLC is the platform utility token used for creator rewards and governance on Polygon.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
