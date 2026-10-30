import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Scaling, Maximize2, Minimize2, RotateCcw, Sliders, RefreshCw } from 'lucide-react';
import { CameraView } from './CameraView';
import { HeadPoseData, HeadTracker } from '../headTracker';

interface ResizableCameraDockProps {
  tracker: HeadTracker;
  poseData: HeadPoseData | null;
  selectedDirection: 'left' | 'right' | 'center';
  isLockedIn?: boolean;
}

interface Dimensions {
  width: number;
  height: number;
}

const STORAGE_KEY = 'head_tilt_camera_dock_dims_v1';
const DEFAULT_DIMS: Dimensions = { width: 250, height: 250 }; // Default 250px x 250px as requested!
const MIN_WIDTH = 160;
const MAX_WIDTH = 450;
const MIN_HEIGHT = 140;
const MAX_HEIGHT = 420;

export const ResizableCameraDock: React.FC<ResizableCameraDockProps> = ({
  tracker,
  poseData,
  selectedDirection,
  isLockedIn = false,
}) => {
  // Load saved dimensions from localStorage or default to 250x250
  const [dims, setDims] = useState<Dimensions>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (
            typeof parsed.width === 'number' &&
            typeof parsed.height === 'number' &&
            parsed.width >= MIN_WIDTH &&
            parsed.width <= MAX_WIDTH
          ) {
            return {
              width: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parsed.width)),
              height: Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, parsed.height)),
            };
          }
        } catch {
          // fallback to default
        }
      }
    }
    return DEFAULT_DIMS;
  });

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Save to localStorage when dimensions change
  const saveDimensions = useCallback((newDims: Dimensions) => {
    setDims(newDims);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDims));
    }
  }, []);

  // Quick preset sizes
  const handleSelectPreset = (preset: 'small' | 'default' | 'large') => {
    setIsMinimized(false);
    if (preset === 'small') {
      saveDimensions({ width: 180, height: 180 });
    } else if (preset === 'default') {
      saveDimensions({ width: 250, height: 250 });
    } else if (preset === 'large') {
      saveDimensions({ width: 320, height: 300 });
    }
  };

  const handleResetToDefault = () => {
    setIsMinimized(false);
    saveDimensions(DEFAULT_DIMS);
  };

  // Pointer drag resizing handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // In case currently minimized, restore first
    if (isMinimized) {
      setIsMinimized(false);
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: dims.width,
      startH: dims.height,
    };

    const handlePointerMove = (moveEv: PointerEvent) => {
      if (!dragStartRef.current) return;
      // Because camera dock is anchored on the right/bottom:
      // Moving left (smaller clientX) means increasing width
      // Moving up (smaller clientY) means increasing height
      const deltaX = dragStartRef.current.startX - moveEv.clientX;
      const deltaY = dragStartRef.current.startY - moveEv.clientY;

      const nextW = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(dragStartRef.current.startW + deltaX)));
      const nextH = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(dragStartRef.current.startH + deltaY)));

      setDims({ width: nextW, height: nextH });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      // Persist final size
      setDims((current) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        }
        return current;
      });
      dragStartRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className="relative flex flex-col items-end flex-shrink-0 select-none group">
      {/* Top Toolbar / Preset bar */}
      <div className="flex items-center gap-1 mb-1 px-1.5 py-0.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300 shadow-md backdrop-blur-sm z-30 transition-opacity">
        <span className="text-slate-400 font-medium hidden sm:inline mr-0.5">Khung camera:</span>

        {/* Quick Size Presets */}
        <button
          type="button"
          onClick={() => handleSelectPreset('small')}
          className={`px-1.5 py-0.5 rounded font-mono font-semibold transition-colors ${
            !isMinimized && dims.width === 180
              ? 'bg-sky-600 text-white'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Thu nhỏ camera (180px)"
        >
          180px
        </button>

        <button
          type="button"
          onClick={() => handleSelectPreset('default')}
          className={`px-1.5 py-0.5 rounded font-mono font-semibold transition-colors ${
            !isMinimized && dims.width === 250 && dims.height === 250
              ? 'bg-indigo-600 text-white'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Cỡ chuẩn ban đầu (250x250px)"
        >
          250px <span className="text-[9px] text-indigo-300 hidden md:inline">(Chuẩn)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectPreset('large')}
          className={`px-1.5 py-0.5 rounded font-mono font-semibold transition-colors ${
            !isMinimized && dims.width === 320
              ? 'bg-sky-600 text-white'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Mở rộng camera (320px)"
        >
          320px
        </button>

        {/* Reset button if custom dragged */}
        {(dims.width !== 250 || dims.height !== 250) && !isMinimized && (
          <button
            type="button"
            onClick={handleResetToDefault}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-300 transition-colors ml-0.5"
            title="Đặt lại về cỡ chuẩn 250x250"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}

        {/* Minimize / Expand Toggle */}
        <button
          type="button"
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors ml-0.5"
          title={isMinimized ? 'Mở rộng khung camera' : 'Thu nhỏ tạm thời'}
        >
          {isMinimized ? <Maximize2 className="w-3 h-3 text-emerald-400" /> : <Minimize2 className="w-3 h-3" />}
        </button>
      </div>

      {/* Camera View Box or Minimized Capsule */}
      {isMinimized ? (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 shadow-lg text-xs font-semibold text-sky-400 hover:bg-slate-800 hover:text-sky-300 transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Mở lại Camera (250x250)</span>
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div
          style={{ width: `${dims.width}px`, height: `${dims.height}px` }}
          className={`relative rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-75 ${
            isDragging
              ? 'border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.5)] ring-2 ring-indigo-500/30'
              : selectedDirection === 'left'
              ? 'border-sky-500 shadow-[0_0_25px_rgba(56,189,248,0.35)]'
              : selectedDirection === 'right'
              ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.35)]'
              : 'border-slate-700/90 hover:border-slate-500'
          }`}
        >
          {/* Interactive Drag Handle in Top-Left Corner */}
          <div
            onPointerDown={handlePointerDown}
            className={`absolute top-0 left-0 w-8 h-8 z-30 cursor-nwse-resize flex items-center justify-center rounded-br-xl transition-all ${
              isDragging
                ? 'bg-indigo-600 text-white shadow-lg scale-110'
                : 'bg-slate-900/80 hover:bg-indigo-600 text-slate-300 hover:text-white border-r border-b border-slate-700/80'
            }`}
            title="Nhấn giữ và kéo để thu phóng kích thước camera theo ý muốn"
          >
            <Scaling className="w-4 h-4 rotate-90" />
          </div>

          {/* Live Drag Size Indicator Tag */}
          {isDragging && (
            <div className="absolute top-2 left-10 z-30 px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-[11px] font-bold shadow-md animate-pulse">
              {dims.width} × {dims.height} px
            </div>
          )}

          {/* Actual Camera Feed Component */}
          <CameraView
            tracker={tracker}
            poseData={poseData}
            selectedDirection={selectedDirection}
            isLockedIn={isLockedIn}
            miniMode={dims.width < 200}
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
};
