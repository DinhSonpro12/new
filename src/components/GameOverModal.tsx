import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Award, Flame, CheckCircle, XCircle } from 'lucide-react';
import { sound } from '../soundEffects';
import { Question } from '../questions';

interface GameResultSummary {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  maxStreak: number;
  history: {
    question: Question;
    userChoice: 'left' | 'right' | 'timeout';
    isCorrect: boolean;
  }[];
}

interface GameOverModalProps {
  summary: GameResultSummary;
  highScore: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  summary,
  highScore,
  onPlayAgain,
  onGoHome,
}) => {
  const accuracy = summary.totalQuestions > 0 ? Math.round((summary.correctAnswers / summary.totalQuestions) * 100) : 0;
  const isNewHighScore = summary.score > highScore;

  useEffect(() => {
    // Sound effect
    sound.playVictory();

    // Confetti cannons
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);

      return () => clearTimeout(timer);
    } catch {
      // Ignore if canvas-confetti is unsupported
    }
  }, []);

  const getRankTitle = (acc: number) => {
    if (acc === 100) return 'BẬC THẦY NGHIÊNG ĐẦU 👑';
    if (acc >= 80) return 'THÁNH PHẢN XẠ NHANH ⚡';
    if (acc >= 60) return 'CAO THỦ ĐỐ VUI 🧠';
    if (acc >= 40) return 'TẬP SỰ NHANH NHẸN 🎯';
    return 'CỐ GẮNG LẦN SAU NHÉ 🌱';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-slate-100 flex flex-col items-center">
        {/* Top Trophy Icon */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Trophy className="w-10 h-10 text-slate-950 stroke-[2]" />
          </div>
          {isNewHighScore && (
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-rose-600 border border-rose-400 text-white font-extrabold text-[10px] uppercase tracking-wider animate-bounce">
              Kỷ Lục Mới!
            </span>
          )}
        </div>

        {/* Title & Rank */}
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
          KẾT QUẢ VÒNG CHƠI
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-1">
          {getRankTitle(accuracy)}
        </h2>

        {/* Big Score Card */}
        <div className="w-full my-5 py-4 px-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col items-center justify-center">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-0.5">
            Tổng Điểm Đạt Được
          </span>
          <span className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight tabular-nums">
            {summary.score.toLocaleString()}
          </span>
        </div>

        {/* Performance Metrics Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2.5 mb-6 text-center">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="block text-[11px] text-slate-400 font-medium mb-1">Số câu đúng</span>
            <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
              {summary.correctAnswers}/{summary.totalQuestions}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="block text-[11px] text-slate-400 font-medium mb-1">Độ chính xác</span>
            <span className="text-lg font-bold text-sky-400 font-mono tabular-nums">
              {accuracy}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="block text-[11px] text-slate-400 font-medium mb-1">Chuỗi cao nhất</span>
            <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">
              x{summary.maxStreak} 🔥
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi Lại (Space)</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Trang Chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
