"use client";

import { useRef, useState, useTransition } from "react";
import { uploadAvatarAction } from "@/app/actions";

const MAX_DIM = 400; // resize to fit within 400×400
const JPEG_QUALITY = 0.82;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.onerror = reject;
    img.src = url;
  });
}

interface Props {
  currentAvatarUrl: string | null;
}

export function AvatarUpload({ currentAvatarUrl }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError(null);
    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
    } catch {
      setError("Could not read that image. Try another file.");
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!preview || preview === currentAvatarUrl) return;

    const formData = new FormData();
    formData.set("avatar_data_url", preview);

    startTransition(async () => {
      await uploadAvatarAction(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Your photo</h3>
      <div className="flex items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Your photo" className="h-16 w-16 rounded-full object-cover ring-2 ring-stone-200 dark:ring-stone-700" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-2xl dark:bg-stone-800">🤍</div>
        )}
        <div className="flex-1">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-stone-800 dark:text-stone-200">Upload a photo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:text-stone-400 dark:file:bg-stone-700 dark:file:text-stone-200"
            />
          </label>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Any size — automatically resized. Your partner sees this on their home screen.</p>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={pending || !preview || preview === currentAvatarUrl}
        className="min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold btn-accent transition disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save photo"}
      </button>
    </form>
  );
}
