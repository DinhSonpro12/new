import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Check } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  compact?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Resize and compress image using HTML5 Canvas to keep Base64 lightweight for localStorage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          onChange(event.target?.result as string);
          setIsProcessing(false);
          return;
        }

        // Max bounds 720px
        const maxDim = 720;
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        // Convert to web-friendly JPEG data url with 0.8 quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onChange(compressedDataUrl);
        setIsProcessing(false);
      };

      img.onerror = () => {
        setIsProcessing(false);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
    // Reset file input value so re-uploading the same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setUrlDraft('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <span>{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Xóa ảnh</span>
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        /* Image Preview Box */
        <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center p-1.5">
          <img
            src={value}
            alt={label}
            className={`w-full object-contain rounded-lg transition-transform ${
              compact ? 'h-24' : 'h-36 max-h-48'
            }`}
          />
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-md transition-colors"
            >
              <Upload className="w-3 h-3" />
              <span>Đổi ảnh</span>
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-md transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Xóa</span>
            </button>
          </div>
        </div>
      ) : showUrlInput ? (
        /* URL Input Box */
        <div className="flex items-center gap-1.5">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Dán đường dẫn ảnh https://..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs transition-colors"
            title="Sử dụng ảnh này"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
            title="Đóng"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Upload Buttons Container */
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isProcessing ? 'Đang nén ảnh...' : 'Tải ảnh lên'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Chèn ảnh từ đường dẫn URL"
          >
            <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Dán link</span>
          </button>
        </div>
      )}
    </div>
  );
};
