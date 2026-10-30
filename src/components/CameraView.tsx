import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, RefreshCw, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { HeadPoseData, HeadTracker, SensitivityLevel } from '../headTracker';

interface CameraViewProps {
  tracker: HeadTracker;
  poseData: HeadPoseData | null;
  selectedDirection: 'left' | 'right' | 'center';
  isLockedIn?: boolean;
  onCameraStatusChange?: (isActive: boolean) => void;
  className?: string;
  miniMode?: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({
  tracker,
  poseData,
  selectedDirection,
  isLockedIn = false,
  onCameraStatusChange,
  className = '',
  miniMode = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>(tracker.getSensitivity());
  const [isMirrored, setIsMirrored] = useState<boolean>(tracker.getMirrored());

  // Initialize camera on mount
  useEffect(() => {
    let isMounted = true;

    async function setupCamera() {
      if (!videoRef.current) return;
      try {
        const success = await tracker.startCamera(videoRef.current);
        if (isMounted) {
          setCameraActive(success);
          if (onCameraStatusChange) onCameraStatusChange(success);
          if (!success) {
            setCameraError('Không thể mở camera. Bạn vẫn có thể dùng phím mũi tên ◄ ► hoặc nhấn trực tiếp!');
          }
        }
      } catch (err) {
        if (isMounted) {
          setCameraActive(false);
          setCameraError('Camera bị từ chối hoặc đang bận. Đã bật điều khiển bằng bàn phím.');
          if (onCameraStatusChange) onCameraStatusChange(false);
        }
      }
    }

    setupCamera();

    return () => {
      isMounted = false;
    };
  }, [tracker, onCameraStatusChange]);

  // Draw HUD lines, artificial horizon and angle onto canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Dynamically match canvas internal resolution to rendered dimensions
    if (canvas.clientWidth && canvas.clientHeight) {
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!cameraActive) return;

    const cx = w / 2;
    const cy = h / 2;
    const tilt = poseData ? poseData.tiltAngle : 0;
    const rad = (tilt * Math.PI) / 180;

    // Draw central target ring
    ctx.save();
    ctx.strokeStyle = selectedDirection === 'center' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Draw dynamic horizon tilt bar
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rad);

    // Color based on active tilt
    let barColor = 'rgba(255, 255, 255, 0.7)';
    if (selectedDirection === 'left') {
      barColor = '#38bdf8'; // Sky blue
    } else if (selectedDirection === 'right') {
      barColor = '#f43f5e'; // Rose
    }

    ctx.strokeStyle = barColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-60, 0);
    ctx.lineTo(60, 0);
    ctx.stroke();

    // Nose pointer
    ctx.fillStyle = barColor;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(6, 6);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }, [poseData, selectedDirection, cameraActive]);

  const handleSensitivityChange = (lvl: SensitivityLevel) => {
    setSensitivity(lvl);
    tracker.setSensitivity(lvl);
  };

  const handleToggleMirror = () => {
    const next = !isMirrored;
    setIsMirrored(next);
    tracker.setMirrored(next);
  };

  const handleCalibrate = () => {
    tracker.calibrate();
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl transition-all duration-300 ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover transition-transform duration-300 ${
          isMirrored ? 'scale-x-[-1]' : ''
        } ${cameraActive ? 'opacity-90' : 'opacity-0'}`}
      />

      {/* Fallback Display if Camera is unavailable */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900/95 text-slate-300">
          <CameraOff className="w-10 h-10 mb-2 text-rose-400 stroke-[1.5]" />
          <p className="text-sm font-medium text-slate-200 mb-1">
            {cameraError || 'Đang kết nối camera...'}
          </p>
          <p className="text-xs text-slate-400 max-w-xs mb-3">
            Bạn có thể dùng phím <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[11px]">◄ Trái</kbd> và <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[11px]">Phải ►</kbd> hoặc nhấn vào đáp án.
          </p>
          <button
            onClick={() => {
              if (videoRef.current) tracker.startCamera(videoRef.current);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Thử lại camera
          </button>
        </div>
      )}

      {/* Canvas Overlay for Pose Tracking */}
      {cameraActive && (
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {/* Edge Tilt Glow Feedback */}
      {selectedDirection === 'left' && (
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-sky-500/40 to-transparent pointer-events-none animate-pulse" />
      )}
      {selectedDirection === 'right' && (
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-rose-500/40 to-transparent pointer-events-none animate-pulse" />
      )}

      {/* Top Floating Mini-Bar */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
        {/* Detection Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950/70 backdrop-blur-sm border border-slate-800/80 text-[11px] font-medium">
          {cameraActive && poseData?.isFaceDetected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-300">Đã khóa mặt</span>
            </>
          ) : cameraActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-amber-300">Đang tìm mặt</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-slate-400">Phím ◄ ►</span>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 pointer-events-auto">
          <button
            onClick={handleCalibrate}
            title="Căn chuẩn vị trí đầu thẳng (Zero calibration)"
            className="p-1.5 rounded-md bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {!miniMode && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Cài đặt camera & độ nhạy"
              className="p-1.5 rounded-md bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Real-time Angle & Direction Gauge (Bottom overlay) */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800/80">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold transition-colors ${
              selectedDirection === 'left' ? 'text-sky-400 scale-110' : 'text-slate-500'
            }`}
          >
            ◄ TRÁI
          </span>
          <span className="text-[10px] text-slate-600">|</span>
          <span
            className={`text-xs font-bold transition-colors ${
              selectedDirection === 'right' ? 'text-rose-400 scale-110' : 'text-slate-500'
            }`}
          >
            PHẢI ►
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300 tabular-nums">
          <span>Góc:</span>
          <span
            className={`font-semibold ${
              poseData && Math.abs(poseData.tiltAngle) >= tracker.getThreshold().enter
                ? poseData.tiltAngle < 0
                  ? 'text-sky-400'
                  : 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {poseData ? `${poseData.tiltAngle > 0 ? '+' : ''}${poseData.tiltAngle.toFixed(1)}°` : '0.0°'}
          </span>
        </div>
      </div>

      {/* Settings Panel Popover */}
      {showSettings && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md p-4 flex flex-col justify-between z-20 text-xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <span className="font-bold text-slate-100">Cài Đặt Cảm Biến Nghiêng</span>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1.5">Độ nhạy nghiêng đầu:</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  {(['low', 'normal', 'high'] as SensitivityLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handleSensitivityChange(lvl)}
                      className={`py-1 rounded font-medium capitalize transition-all ${
                        sensitivity === lvl
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl === 'low' ? 'Nhẹ (16°)' : lvl === 'normal' ? 'Vừa (11°)' : 'Nhạy (7°)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-300">Lật gương camera:</span>
                <button
                  onClick={handleToggleMirror}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    isMirrored ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isMirrored ? 'Đang bật' : 'Tắt'}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-300">Căn chuẩn đầu thẳng:</span>
                <button
                  onClick={() => {
                    handleCalibrate();
                    setShowSettings(false);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                >
                  Căn chuẩn ngay
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-center transition-colors"
          >
            Xác nhận
          </button>
        </div>
      )}
    </div>
  );
};
