"use client";

import { useState, useRef, useCallback } from "react";
import { X, Image as ImageIcon } from "@phosphor-icons/react";

interface ImageUploadBoxProps {
  value: string | null;
  onUpload: (file: File) => Promise<void>;
  onClear: () => void;
  label?: string;
  hint?: string;
  maxSizeMB?: number;
  accept?: string;
  /** Logo mode: fixed height (36px), variable width based on aspect ratio (max ~115px for 480:150 ratio) */
  logoMode?: boolean;
}

// Apple Wallet logo dimensions: max 480×150 (@3x), ratio is 3.2:1
// We'll use a fixed height and let width vary based on uploaded image aspect ratio
const LOGO_HEIGHT = 36;
const LOGO_MAX_WIDTH = 115; // 36 * 3.2 ≈ 115

export function ImageUploadBox({
  value,
  onUpload,
  onClear,
  label,
  hint = "PNG, max 2MB",
  maxSizeMB = 2,
  accept = "image/png",
  logoMode = false,
}: ImageUploadBoxProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file type
      if (!file.type.match(accept.replace("*", ".*"))) {
        setError("Please upload a PNG image");
        return;
      }

      // Validate file size
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File must be less than ${maxSizeMB}MB`);
        return;
      }

      setIsLoading(true);
      try {
        await onUpload(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsLoading(false);
      }
    },
    [accept, maxSizeMB, onUpload]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  // Logo mode: fixed height, variable width based on aspect ratio
  if (logoMode && value) {
    return (
      <div className="relative flex-shrink-0">
        {label && (
          <span className="block text-xs text-[var(--muted-foreground)] mb-1">{label}</span>
        )}
        <div
          className="group relative rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-center p-2"
          style={{ height: LOGO_HEIGHT + 16, maxWidth: LOGO_MAX_WIDTH + 16 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded logo"
            className="object-contain"
            style={{ height: LOGO_HEIGHT, maxWidth: LOGO_MAX_WIDTH }}
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="Remove image"
          >
            <X className="w-3 h-3 text-white" weight="bold" />
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // Standard square mode with uploaded image
  if (value) {
    return (
      <div className="relative flex-shrink-0">
        {label && (
          <span className="block text-xs text-[var(--muted-foreground)] mb-1">{label}</span>
        )}
        <div className="group relative w-[100px] h-[100px] rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--muted)]/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="Remove image"
          >
            <X className="w-3 h-3 text-white" weight="bold" />
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // Empty state - upload box
  const boxSize = logoMode
    ? { width: 100, height: LOGO_HEIGHT + 16 }
    : { width: 100, height: 100 };

  return (
    <div className="relative flex-shrink-0">
      {label && (
        <span className="block text-xs text-[var(--muted-foreground)] mb-1">{label}</span>
      )}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          rounded-xl border-2 border-dashed
          flex flex-col items-center justify-center gap-1 cursor-pointer
          transition-all duration-200
          ${isDragOver
            ? "border-[var(--accent)] bg-[var(--accent)]/10"
            : "border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--muted)]/30"
          }
          ${isLoading ? "pointer-events-none opacity-60" : ""}
        `}
        style={{ width: boxSize.width, height: boxSize.height }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          aria-label="Upload image"
        />
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <ImageIcon className="w-5 h-5 text-[var(--muted-foreground)]" />
            <span className="text-[10px] text-[var(--muted-foreground)] text-center px-1">
              {hint}
            </span>
          </>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 max-w-[100px]">{error}</p>
      )}
    </div>
  );
}
