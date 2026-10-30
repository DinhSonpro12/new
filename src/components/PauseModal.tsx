import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Timer } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  holdDuration: number;
  onChangeHoldDuration: (sec: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuit,
  holdDuration,
  onChangeHoldDuration,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col items-center">
        <h2 className="text-2xl font-black text-white mb-1">ĐÃ TẠM DỪNG</h2>
        <p className="text-xs text-slate-400 mb-5 text-center">
          Nhấn Tiếp Tục hoặc phím Esc để chơi tiếp
        </p>

        {/* Hold speed adjustment inside Pause */}
        <div className="w-full p-3.5 mb-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-sky-400">
            <span className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5" />
              Tốc độ chốt nghiêng đầu:
            </span>
            <span className="font-mono text-white">{holdDuration.toFixed(1)}s</span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {[1.0, 1.5, 2.0, 3.0].map((sec) => (
              <button
                key={sec}
                onClick={() => onChangeHoldDuration(sec)}
                className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  holdDuration === sec
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        <div className="w-full space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Tiếp Tục Chơi (Esc)</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-6 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Bắt Đầu Lại Vòng Này</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2.5 px-6 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Bật Âm Thanh' : 'Tắt Âm Thanh'}</span>
          </button>

          <button
            onClick={onQuit}
            className="w-full py-2.5 px-6 rounded-xl font-semibold text-slate-400 hover:text-rose-300 bg-slate-950/50 hover:bg-slate-900 border border-slate-800/80 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Về Màn Hình Chính</span>
          </button>
        </div>
      </div>
    </div>
  );
};
