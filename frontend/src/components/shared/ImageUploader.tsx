import React, { useState, useRef, useEffect } from 'react';
import { Image, Upload, X, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import { imageUrl } from '@/utils/imageUrl';

interface ImageUploaderProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function ImageUploader({ urls: externalUrls, onChange, maxFiles = 10 }: ImageUploaderProps) {
  const [urls, setUrls] = useState<string[]>(externalUrls);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external changes (e.g. when editing a trade with existing screenshots)
  useEffect(() => {
    setUrls(externalUrls);
  }, [externalUrls]);

  // Notify parent whenever urls change internally
  useEffect(() => {
    onChange(urls);
  }, [urls]); // eslint-disable-line react-hooks/exhaustive-deps

  const remaining = maxFiles - urls.length - Object.keys(uploading).length;

  const uploadFile = async (file: File) => {
    const id = `${file.name}-${Date.now()}`;
    setUploading((prev) => ({ ...prev, [id]: true }));

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUrls((prev) => [...prev, res.data.url]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const allowed = Math.min(fileArray.length, remaining);
    for (let i = 0; i < allowed; i++) {
      uploadFile(fileArray[i]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = async (url: string) => {
    const filename = url.split('/').pop();
    if (!filename) return;
    try {
      await api.delete(`/upload/${filename}`);
    } catch {
      // best-effort delete on server
    }
    setUrls((prev) => prev.filter((u) => u !== url));
  };

  return (
    <div className="space-y-3">
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl(urls[lightboxIndex])}
              alt={`Screenshot ${lightboxIndex + 1} of ${urls.length}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
          {urls.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {urls.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                    idx === lightboxIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Image className="w-4 h-4 text-green" />
        <span className="text-xs font-medium text-text2">
          Screenshots ({urls.length})
        </span>
      </div>

      {/* Preview grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {urls.map((url) => (
            <div
              key={url}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-surface2 cursor-pointer"
              onClick={() => setLightboxIndex(urls.indexOf(url))}
            >
              <img
                src={imageUrl(url)}
                alt="Trade screenshot"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(url);
                }}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {remaining > 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          className={cn(
            'flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg transition-colors cursor-pointer',
            dragOver
              ? 'border-green bg-green/5'
              : 'border-border hover:border-green/50 hover:bg-surface2',
          )}
        >
          <Upload className="w-5 h-5 text-text2 mb-1" />
          <span className="text-[11px] text-gray-500">
            Drop images here or click to browse
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5">
            JPEG, PNG, GIF, WebP — {remaining} file{remaining !== 1 ? 's' : ''} remaining
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Uploading indicators */}
      {Object.keys(uploading).length > 0 && (
        <div className="flex gap-2">
          {Object.keys(uploading).map((id) => (
            <div
              key={id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface2 border border-border"
            >
              <Loader2 className="w-3 h-3 text-green animate-spin" />
              <span className="text-[10px] text-text2">Uploading...</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
