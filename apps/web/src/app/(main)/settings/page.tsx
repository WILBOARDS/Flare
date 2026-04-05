'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';
import { CLOUDINARY_UPLOAD_URL } from '@/lib/constants';
import { useAuth } from '@/providers/auth-provider';

export default function SettingsPage() {
  const { user, refreshUser, signOut } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState(user?.username ?? '');
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [walletAddress, setWalletAddress] = useState(user?.walletAddress ?? '');
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) { toast.error('Image must be under 5MB'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null;
    const { data: sigData } = await apiClient.post('/upload/avatar-signature');
    const { timestamp, signature, cloudName, apiKey, folder } = sigData;
    const formData = new FormData();
    formData.append('file', avatarFile);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    formData.append('api_key', apiKey);
    formData.append('folder', folder);
    const res = await fetch(CLOUDINARY_UPLOAD_URL(cloudName), { method: 'POST', body: formData });
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && !username.match(/^[a-zA-Z0-9_]{3,30}$/)) {
      toast.error('Username: 3-30 chars, letters/numbers/underscore only');
      return;
    }
    setSaving(true);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile) {
        setUploadingAvatar(true);
        const url = await uploadAvatar();
        setUploadingAvatar(false);
        if (url) avatarUrl = url;
      }
      await apiClient.patch('/users/me', {
        username: username || undefined,
        displayName: displayName || undefined,
        bio: bio || undefined,
        walletAddress: walletAddress || undefined,
        avatarUrl,
      });
      await refreshUser();
      toast.success('Profile updated!');
      if (user?.username !== username && username) {
        router.replace(`/profile/${username}`);
      }
    } catch (err: any) {
      setUploadingAvatar(false);
      toast.error(err?.response?.data?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.replace('/login');
  };

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-neutral-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-neutral-400" />
        </button>
        <h1 className="font-bold text-lg">Settings</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-6 space-y-6"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-brand to-orange-400 flex items-center justify-center">
              {avatarPreview ? (
                <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" />
              ) : user?.avatarUrl ? (
                <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {(user?.displayName || user?.username || '?')[0].toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-brand rounded-full flex items-center justify-center border-2 border-[#0A0A0A] hover:bg-orange-500 transition-colors"
              aria-label="Change avatar"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-white" />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>
          <p className="text-xs text-neutral-500">
            {avatarPreview ? 'New photo selected — save to apply' : 'Tap the camera to change your photo'}
          </p>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">@</span>
              <input
                className="input pl-8"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="yourname"
                maxLength={30}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Display Name
            </label>
            <input
              className="input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Bio
            </label>
            <textarea
              className="input resize-none"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about yourself..."
              maxLength={300}
            />
            <p className="text-xs text-neutral-600 mt-1 text-right">{bio.length}/300</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Wallet Address
            </label>
            <input
              className="input font-mono text-sm"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              maxLength={42}
            />
            <p className="text-xs text-neutral-600 mt-1">Your Polygon wallet for FLC rewards</p>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Save Changes'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="border-t border-neutral-800" />

        {/* Account info */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Account</p>
          {user?.email && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-400">Email</span>
              <span className="text-sm text-neutral-300">{user.email}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-neutral-400">Member since</span>
            <span className="text-sm text-neutral-300">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-900/50 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-semibold"
        >
          {signingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <><LogOut className="w-4 h-4" /> Sign Out</>
          )}
        </button>
      </motion.div>
    </div>
  );
}
