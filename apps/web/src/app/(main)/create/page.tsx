'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '@/lib/api-client';
import { CLOUDINARY_UPLOAD_URL } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function CreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10_000_000) { toast.error('Image must be under 10MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<{ url: string; publicId: string } | null> => {
    if (!imageFile) return null;
    const { data: sigData } = await apiClient.post('/upload/signature');
    const { timestamp, signature, cloudName, apiKey, folder } = sigData;
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    formData.append('api_key', apiKey);
    formData.append('folder', folder);
    const res = await fetch(CLOUDINARY_UPLOAD_URL(cloudName), { method: 'POST', body: formData });
    const data = await res.json();
    return { url: data.secure_url, publicId: data.public_id };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { toast.error('Write something first'); return; }
    setLoading(true);
    try {
      const imageData = imageFile ? await uploadImage() : null;
      await apiClient.post('/posts', {
        content: content.trim(),
        imageUrl: imageData?.url,
        imagePublicId: imageData?.publicId,
      });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Posted!');
      router.push('/feed');
    } catch {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="btn-ghost">Cancel</button>
        <h1 className="font-bold text-lg">New Post</h1>
        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="btn-primary py-2 px-5 text-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : 'Post'}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <textarea
          className="w-full bg-transparent text-white text-lg placeholder-neutral-600 outline-none resize-none min-h-[150px]"
          placeholder="What's happening on-chain?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          autoFocus
        />

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-neutral-500 hover:text-brand transition-colors"
          >
            <ImagePlus className="w-6 h-6" />
          </button>
          <span className={`text-xs ${content.length > 450 ? 'text-red-400' : 'text-neutral-600'}`}>
            {content.length}/500
          </span>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

        {imagePreview && (
          <div className="mt-3 relative rounded-xl overflow-hidden">
            <Image src={imagePreview} alt="Preview" width={600} height={400} className="w-full object-cover max-h-72" />
            <button
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute top-2 right-2 bg-black/70 rounded-full p-1.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
