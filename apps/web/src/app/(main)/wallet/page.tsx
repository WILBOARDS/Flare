'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins, RefreshCw, ExternalLink, Copy, Check,
  Wallet, PlusCircle, KeyRound, Eye, EyeOff,
  ShieldCheck, AlertTriangle, ArrowLeft, Loader2,
  ClipboardPaste,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/providers/auth-provider';
import { useFLCBalance } from '@/hooks/use-flc-balance';
import apiClient from '@/lib/api-client';
import {
  generateWallet,
  encryptMnemonic,
  isValidAddress,
} from '@/lib/wallet-crypto';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return { copied, copy };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MnemonicGrid({ words }: { words: string[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 my-4">
      {words.map((word, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-neutral-800 rounded-lg px-3 py-2"
        >
          <span className="text-[10px] text-neutral-500 w-4 shrink-0">{i + 1}</span>
          <span className="text-sm font-mono text-white">{word}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Flows
// ---------------------------------------------------------------------------

type SetupView =
  | 'choose'
  | 'connect-manual'
  | 'create-backup'
  | 'create-password'
  | 'create-encrypting'
  | 'done';

interface CreateState {
  mnemonic: string;
  address: string;
}

function SetupWallet({ onComplete }: { onComplete: () => void }) {
  const [view, setView] = useState<SetupView>('choose');
  const [createState, setCreateState] = useState<CreateState | null>(null);
  const [backupConfirmed, setBackupConfirmed] = useState(false);

  // Manual connect state
  const [manualAddress, setManualAddress] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  // Password state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [mnemonicVisible, setMnemonicVisible] = useState(false);

  const { refreshUser } = useAuth();

  // ---- Connect existing wallet ----
  const handleConnectManual = async () => {
    const addr = manualAddress.trim();
    if (!isValidAddress(addr)) {
      toast.error('Enter a valid Polygon/Ethereum address (0x…)');
      return;
    }
    setManualLoading(true);
    try {
      await apiClient.post('/users/me/wallet', { walletAddress: addr });
      await refreshUser();
      onComplete();
      toast.success('Wallet connected!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save wallet');
    } finally {
      setManualLoading(false);
    }
  };

  // ---- Create new wallet ----
  const handleGenerate = () => {
    const wallet = generateWallet();
    setCreateState(wallet);
    setBackupConfirmed(false);
    setView('create-backup');
  };

  const handleEncryptAndSave = async () => {
    if (!createState) return;
    if (password.length < 8) {
      toast.error('Wallet password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setView('create-encrypting');
    try {
      const keystoreJson = await encryptMnemonic(
        createState.mnemonic,
        password,
        createState.address,
      );
      await apiClient.post('/users/me/wallet', {
        walletAddress: createState.address,
        encryptedKeystore: keystoreJson,
      });
      await refreshUser();
      setView('done');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Encryption failed');
      setView('create-password');
    }
  };

  const words = createState?.mnemonic.split(' ') ?? [];

  return (
    <AnimatePresence mode="wait">
      {/* ── Choose ── */}
      {view === 'choose' && (
        <motion.div
          key="choose"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-brand/20 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-brand" />
            </div>
            <h2 className="text-xl font-black text-white">Set Up Your Wallet</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Your wallet lets you hold and earn FLC tokens on Polygon.
            </p>
          </div>

          <button
            onClick={() => setView('connect-manual')}
            className="card p-5 w-full text-left flex items-start gap-4 hover:border-brand/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-800 group-hover:bg-brand/20 flex items-center justify-center shrink-0 transition-colors">
              <ClipboardPaste className="w-5 h-5 text-neutral-400 group-hover:text-brand" />
            </div>
            <div>
              <p className="font-semibold text-white">Connect Existing Wallet</p>
              <p className="text-sm text-neutral-500 mt-0.5">
                Enter your Polygon wallet address (MetaMask, Coinbase Wallet, etc.)
              </p>
            </div>
          </button>

          <button
            onClick={handleGenerate}
            className="card p-5 w-full text-left flex items-start gap-4 hover:border-brand/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-800 group-hover:bg-brand/20 flex items-center justify-center shrink-0 transition-colors">
              <PlusCircle className="w-5 h-5 text-neutral-400 group-hover:text-brand" />
            </div>
            <div>
              <p className="font-semibold text-white">Create New Wallet</p>
              <p className="text-sm text-neutral-500 mt-0.5">
                Generate a fresh wallet secured with your password. No app or extension needed.
              </p>
            </div>
          </button>

          <p className="text-xs text-center text-neutral-600 pt-2">
            <ShieldCheck className="inline w-3 h-3 mr-1" />
            Your private key never leaves your device.
          </p>
        </motion.div>
      )}

      {/* ── Connect Manual ── */}
      {view === 'connect-manual' && (
        <motion.div
          key="connect-manual"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-4"
        >
          <button
            onClick={() => setView('choose')}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div>
            <h2 className="text-xl font-black text-white">Connect Existing Wallet</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Paste your Polygon-compatible wallet address below.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Wallet Address
            </label>
            <input
              className="input font-mono text-sm"
              type="text"
              placeholder="0x…"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value.trim())}
              spellCheck={false}
              autoComplete="off"
            />
            {manualAddress && !isValidAddress(manualAddress) && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Not a valid Ethereum address
              </p>
            )}
          </div>

          <button
            onClick={handleConnectManual}
            disabled={manualLoading || !isValidAddress(manualAddress)}
            className="btn-primary w-full"
          >
            {manualLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              'Connect Wallet'
            )}
          </button>
        </motion.div>
      )}

      {/* ── Create: Backup Mnemonic ── */}
      {view === 'create-backup' && createState && (
        <motion.div
          key="create-backup"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-4"
        >
          <button
            onClick={() => setView('choose')}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div>
            <h2 className="text-xl font-black text-white">Save Your Recovery Phrase</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Write down these 12 words in order. This is the <span className="text-yellow-400 font-semibold">only way</span> to recover your wallet if you forget your password.
            </p>
          </div>

          <div className="card p-4 border-yellow-800/40 bg-yellow-950/20">
            <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold mb-1">
              <AlertTriangle className="w-4 h-4" />
              Never share your recovery phrase with anyone.
            </div>
            <p className="text-xs text-yellow-600">
              Anyone with these words can access your wallet and steal your funds.
            </p>
          </div>

          <div className="relative">
            {!mnemonicVisible && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm bg-neutral-900/60">
                <KeyRound className="w-8 h-8 text-neutral-400 mb-2" />
                <button
                  onClick={() => setMnemonicVisible(true)}
                  className="btn-primary text-sm px-4 py-2"
                >
                  Reveal Recovery Phrase
                </button>
              </div>
            )}
            <MnemonicGrid words={words} />
          </div>

          {mnemonicVisible && (
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(createState.mnemonic);
                toast.success('Recovery phrase copied — store it safely!');
              }}
              className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy to clipboard
            </button>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 accent-brand"
              checked={backupConfirmed}
              onChange={(e) => setBackupConfirmed(e.target.checked)}
            />
            <span className="text-sm text-neutral-400">
              I have written down my recovery phrase and stored it safely offline.
            </span>
          </label>

          <button
            onClick={() => setView('create-password')}
            disabled={!backupConfirmed || !mnemonicVisible}
            className="btn-primary w-full"
          >
            Continue
          </button>
        </motion.div>
      )}

      {/* ── Create: Set Password ── */}
      {view === 'create-password' && (
        <motion.div
          key="create-password"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-4"
        >
          <button
            onClick={() => setView('create-backup')}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div>
            <h2 className="text-xl font-black text-white">Protect Your Wallet</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Set a wallet password. It encrypts your wallet locally — we never see it.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Wallet Password
            </label>
            <div className="relative">
              <input
                className="input pr-10"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <input
              className="input"
              type={showPw ? 'text' : 'password'}
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Passwords do not match
              </p>
            )}
          </div>

          <div className="card p-3 border-neutral-800 bg-neutral-900/50">
            <p className="text-xs text-neutral-500 leading-relaxed">
              <ShieldCheck className="inline w-3 h-3 mr-1 text-brand" />
              Your wallet is encrypted with AES-256-GCM and PBKDF2 before being stored. Only you can unlock it with this password.
            </p>
          </div>

          <button
            onClick={handleEncryptAndSave}
            disabled={password.length < 8 || password !== confirmPassword}
            className="btn-primary w-full"
          >
            Encrypt &amp; Create Wallet
          </button>
        </motion.div>
      )}

      {/* ── Encrypting (loading) ── */}
      {view === 'create-encrypting' && (
        <motion.div
          key="encrypting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 space-y-4"
        >
          <Loader2 className="w-10 h-10 text-brand animate-spin" />
          <p className="font-semibold text-white">Encrypting your wallet…</p>
          <p className="text-sm text-neutral-500 text-center">
            This may take a moment. Please don't close the app.
          </p>
        </motion.div>
      )}

      {/* ── Done ── */}
      {view === 'done' && createState && (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 py-6"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-black text-white">Wallet Created!</h2>
          <p className="text-sm text-neutral-500">
            Your encrypted wallet is ready. Your address on Polygon:
          </p>
          <div className="card p-3 font-mono text-sm text-white break-all">
            {createState.address}
          </div>
          <button onClick={onComplete} className="btn-primary w-full">
            Go to Wallet
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Connected wallet view
// ---------------------------------------------------------------------------

function ConnectedWallet({ walletAddress }: { walletAddress: string }) {
  const {
    data: flcData,
    isLoading,
    refetch,
    isFetching,
  } = useFLCBalance(walletAddress);

  const { copied: addressCopied, copy: copyAddress } = useCopy(walletAddress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Address card */}
      <div className="card p-4">
        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Wallet Address</p>
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-sm text-white truncate">{truncateAddress(walletAddress)}</p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyAddress}
              className="text-neutral-500 hover:text-white transition-colors"
              title="Copy address"
            >
              {addressCopied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <a
              href={`https://polygonscan.com/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-brand transition-colors"
              title="View on Polygonscan"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
        <p className="text-xs text-neutral-600 mt-2 font-mono break-all">{walletAddress}</p>
      </div>

      {/* FLC Balance */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="font-semibold">FLAIR Coin</p>
              <p className="text-xs text-neutral-500">FLC · Polygon</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-neutral-500 hover:text-white transition-colors"
            title="Refresh balance"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-9 bg-neutral-800 rounded w-40" />
            <div className="h-4 bg-neutral-800 rounded w-16" />
          </div>
        ) : (
          <div>
            <p className="text-3xl font-black text-white">
              {flcData
                ? parseFloat(flcData.balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })
                : '0.00'}
            </p>
            <p className="text-sm text-neutral-500 mt-1">{flcData?.symbol ?? 'FLC'}</p>
          </div>
        )}
      </div>

      {/* Network info */}
      <div className="card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Network</span>
          <span className="text-white font-medium">Polygon</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-neutral-500">Token</span>
          <span className="text-white font-medium">FLC (ERC-20)</span>
        </div>
      </div>

      <p className="text-xs text-center text-neutral-600 pt-1">
        Balance refreshes every 30 seconds automatically.
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const [setupComplete, setSetupComplete] = useState(false);

  const walletAddress = user?.walletAddress;

  const handleSetupComplete = useCallback(async () => {
    await refreshUser();
    setSetupComplete(true);
  }, [refreshUser]);

  return (
    <div>
      <h1 className="text-2xl font-black text-brand mb-6">Wallet</h1>

      {walletAddress ? (
        <ConnectedWallet walletAddress={walletAddress} />
      ) : (
        <SetupWallet onComplete={handleSetupComplete} />
      )}
    </div>
  );
}
