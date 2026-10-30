import React, { useState } from 'react';
import { Volume2, VolumeX, Pause, Flame, Timer, ChevronDown } from 'lucide-react';
import { sound } from '../soundEffects';

interface HudHeaderProps {
  score: number;
  streak: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  totalTime: number;
  holdDuration: number;
  onChangeHoldDuration: (sec: number) => void;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HudHeader: React.FC<HudHeaderProps> = ({
  score,
  streak,
  currentQuestionIndex,
  totalQuestions,
  timeLeft,
  totalTime,
  holdDuration,
  onChangeHoldDuration,
  onPause,
  isMuted,
  onToggleMute,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const timePercent = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  const isUrgent = timeLeft <= 2.5;

  return (
    <header className="w-full px-4 sm:px-8 py-3 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Left cluster: Question Counter & Progress */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tiến Độ
            </span>
            <span className="text-base sm:text-lg font-extrabold text-white font-mono tabular-nums">
              {currentQuestionIndex + 1}
              <span className="text-slate-500 font-normal"> / {totalQuestions}</span>
            </span>
          </div>

          {/* Streak indicator if >= 2 */}
          {streak >= 2 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs animate-bounce">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>x{streak} Chuỗi!</span>
            </div>
          )}
        </div>

        {/* Center: Countdown Timer Bar */}
        <div className="flex-1 max-w-xs sm:max-w-md mx-2 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs font-mono tabular-nums mb-1">
            <span className="text-slate-400 font-medium">Thời gian câu hỏi</span>
            <span className={`font-bold ${isUrgent ? 'text-rose-400 animate-pulse text-sm' : 'text-slate-200'}`}>
              {timeLeft.toFixed(1)}s
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                isUrgent
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                  : 'bg-gradient-to-r from-indigo-500 to-sky-400'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
        </div>

        {/* Right cluster: Hold Speed Switcher, Score & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Hold Speed Selector Button */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              title="Nhấn để chỉnh tốc độ chốt đáp án nghiêng đầu (2s, 1.5s, 1s...)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold font-mono transition-colors cursor-pointer"
            >
              <Timer className="w-3.5 h-3.5 text-sky-400" />
              <span>Giữ {holdDuration}s</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showSpeedMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-40 space-y-1 animate-fadeIn">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Tốc độ chốt nghiêng:
                </div>
                {[1, 1.5, 2, 3, 4].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      onChangeHoldDuration(sec);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                      holdDuration === sec
                        ? 'bg-sky-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{sec} giây</span>
                    <span className="text-[10px] opacity-75">
                      {sec === 1 ? '⚡ Siêu nhanh' : sec === 1.5 ? '🚀 Rất nhanh' : sec === 2 ? '⚡ Nhanh chuẩn' : sec === 3 ? 'Vừa phải' : 'Chắc chắn'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Điểm Số
            </span>
            <span className="text-base sm:text-xl font-black text-amber-400 font-mono tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onPause}
              title="Tạm dừng (Esc)"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
