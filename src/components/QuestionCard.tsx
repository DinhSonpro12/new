import React from 'react';
import { Check, X, ArrowLeft, ArrowRight, Sparkles, Timer } from 'lucide-react';
import { Question } from '../questions';

interface QuestionCardProps {
  question: Question;
  selectedDirection: 'left' | 'right' | 'center';
  isLockedIn: boolean;
  revealResult: boolean;
  lockProgress: number; // 0 to 1
  holdDuration: number; // e.g. 4.0 seconds
  onSelectManual: (direction: 'left' | 'right') => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedDirection,
  isLockedIn,
  revealResult,
  lockProgress,
  holdDuration = 4.0,
  onSelectManual,
}) => {
  const isLeftSelected = selectedDirection === 'left';
  const isRightSelected = selectedDirection === 'right';

  const isLeftCorrect = question.correct === 'left';
  const isRightCorrect = question.correct === 'right';

  const remainingHoldSeconds = Math.max(0, holdDuration * (1 - lockProgress));
  const elapsedHoldSeconds = Math.min(holdDuration, holdDuration * lockProgress);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-2.5 sm:gap-4 px-2 sm:px-4 select-none my-auto">
      {/* Question Prompt Card */}
      <div className="w-full bg-slate-900/90 border border-slate-700/70 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl backdrop-blur-xl relative overflow-hidden transition-all duration-300">
        {/* Category kicker */}
        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-indigo-400 uppercase mb-1.5">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {question.category}
          </span>
          <span className="text-slate-400 text-[11px] sm:text-xs">
            Nghiêng đầu giữ {holdDuration}s để chốt
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white text-center leading-snug tracking-tight">
          {question.question}
        </h2>

        {/* Question Illustration Image if present */}
        {question.imageUrl && (
          <div className="mt-2.5 flex justify-center">
            <div className="relative rounded-xl overflow-hidden border border-slate-700/70 bg-slate-950/80 p-1 shadow-md">
              <img
                src={question.imageUrl}
                alt={question.question}
                className="max-h-24 sm:max-h-36 md:max-h-40 w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Result Explanation on Reveal */}
        {revealResult && question.explanation && (
          <div className="mt-2.5 pt-2 border-t border-slate-800 text-center text-xs sm:text-sm font-medium text-emerald-300 animate-fadeIn">
            {question.explanation}
          </div>
        )}
      </div>

      {/* Two Choice Panels (Left & Right) */}
      <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-4">
        {/* Option A (Left) */}
        <button
          onClick={() => onSelectManual('left')}
          disabled={revealResult}
          className={`group relative flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer overflow-hidden text-white ${
            revealResult
              ? isLeftCorrect
                ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.4)] scale-[1.02]'
                : isLeftSelected
                ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)] opacity-70 animate-shake'
                : 'bg-slate-900/40 border-slate-800 opacity-40'
              : isLeftSelected
              ? 'bg-sky-950/90 border-sky-400 shadow-[0_0_35px_rgba(56,189,248,0.45)] scale-[1.03] -translate-y-1'
              : 'bg-slate-900/80 border-slate-800/80 hover:border-sky-500/50 hover:bg-slate-800/60'
          }`}
        >
          {/* Visual progress fill indicator when holding tilt */}
          {!revealResult && isLeftSelected && (
            <div
              className="absolute inset-0 bg-sky-500/25 pointer-events-none"
              style={{ width: `${Math.min(100, lockProgress * 100)}%` }}
            />
          )}

          {/* Top header of choice */}
          <div className="w-full flex items-center justify-between z-10 mb-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <ArrowLeft className="w-3 h-3" />
              Trái (A)
            </span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono">
              ◄ Phím Trái
            </kbd>
          </div>

          {/* Choice Content */}
          <div className="w-full my-auto py-1 z-10 text-center flex flex-col items-center">
            {question.optionAImage && (
              <div className="mb-1.5 max-w-full">
                <img
                  src={question.optionAImage}
                  alt={question.optionA}
                  className="h-16 sm:h-20 w-auto max-w-full object-contain rounded-lg border border-sky-500/30 bg-slate-950/60 p-1"
                />
              </div>
            )}
            <div className="text-base sm:text-xl font-bold tracking-wide leading-snug">
              {question.optionA}
            </div>
          </div>

          {/* Bottom status & Hold-to-lock indicator */}
          <div className="w-full flex flex-col items-center justify-center pt-2 z-10">
            {revealResult ? (
              isLeftCorrect ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs sm:text-sm">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>ĐÁP ÁN ĐÚNG!</span>
                </div>
              ) : isLeftSelected ? (
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs sm:text-sm">
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>CHƯA CHÍNH XÁC</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500">Bỏ qua</div>
              )
            ) : isLeftSelected ? (
              <div className="w-full flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-sky-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  <Timer className="w-3 h-3 animate-spin text-sky-400" />
                  <span>Giữ:</span>
                  <span className="tabular-nums font-mono text-white text-xs bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-500/40">
                    {elapsedHoldSeconds.toFixed(1)}s / {holdDuration}s
                  </span>
                </div>
                {/* Micro progress bar */}
                <div className="w-32 sm:w-44 h-1 bg-slate-950/70 rounded-full overflow-hidden border border-sky-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-400"
                    style={{ width: `${lockProgress * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
                Nghiêng trái giữ {holdDuration}s
              </div>
            )}
          </div>
        </button>

        {/* Option B (Right) */}
        <button
          onClick={() => onSelectManual('right')}
          disabled={revealResult}
          className={`group relative flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer overflow-hidden text-white ${
            revealResult
              ? isRightCorrect
                ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.4)] scale-[1.02]'
                : isRightSelected
                ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)] opacity-70 animate-shake'
                : 'bg-slate-900/40 border-slate-800 opacity-40'
              : isRightSelected
              ? 'bg-rose-950/90 border-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.45)] scale-[1.03] -translate-y-1'
              : 'bg-slate-900/80 border-slate-800/80 hover:border-rose-500/50 hover:bg-slate-800/60'
          }`}
        >
          {/* Visual progress fill indicator when holding tilt */}
          {!revealResult && isRightSelected && (
            <div
              className="absolute inset-0 bg-rose-500/25 pointer-events-none"
              style={{ width: `${Math.min(100, lockProgress * 100)}%` }}
            />
          )}

          {/* Top header of choice */}
          <div className="w-full flex items-center justify-between z-10 mb-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono">
              Phím Phải ►
            </kbd>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Phải (B)
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Choice Content */}
          <div className="w-full my-auto py-1 z-10 text-center flex flex-col items-center">
            {question.optionBImage && (
              <div className="mb-1.5 max-w-full">
                <img
                  src={question.optionBImage}
                  alt={question.optionB}
                  className="h-16 sm:h-20 w-auto max-w-full object-contain rounded-lg border border-rose-500/30 bg-slate-950/60 p-1"
                />
              </div>
            )}
            <div className="text-base sm:text-xl font-bold tracking-wide leading-snug">
              {question.optionB}
            </div>
          </div>

          {/* Bottom status & Hold-to-lock indicator */}
          <div className="w-full flex flex-col items-center justify-center pt-2 z-10">
            {revealResult ? (
              isRightCorrect ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs sm:text-sm">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>ĐÁP ÁN ĐÚNG!</span>
                </div>
              ) : isRightSelected ? (
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs sm:text-sm">
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>CHƯA CHÍNH XÁC</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500">Bỏ qua</div>
              )
            ) : isRightSelected ? (
              <div className="w-full flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-rose-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  <Timer className="w-3 h-3 animate-spin text-rose-400" />
                  <span>Giữ:</span>
                  <span className="tabular-nums font-mono text-white text-xs bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40">
                    {elapsedHoldSeconds.toFixed(1)}s / {holdDuration}s
                  </span>
                </div>
                {/* Micro progress bar */}
                <div className="w-32 sm:w-44 h-1 bg-slate-950/70 rounded-full overflow-hidden border border-rose-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-rose-400 to-amber-400"
                    style={{ width: `${lockProgress * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
                Nghiêng phải giữ {holdDuration}s
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
