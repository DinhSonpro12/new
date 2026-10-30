import React from 'react';
import { Play, Sparkles, Trophy, Settings, PlusCircle, ArrowLeft, ArrowRight, Zap, Edit3, Timer } from 'lucide-react';
import { QuizPack } from '../questions';
import { CameraView } from './CameraView';
import { HeadPoseData, HeadTracker } from '../headTracker';

interface TitleScreenProps {
  quizPacks: QuizPack[];
  selectedPackId: string;
  onSelectPack: (packId: string) => void;
  questionTime: number;
  onSelectTime: (seconds: number) => void;
  holdDuration: number;
  onSelectHoldDuration: (seconds: number) => void;
  onStartGame: () => void;
  onOpenQuestionEditor: () => void;
  tracker: HeadTracker;
  poseData: HeadPoseData | null;
  highScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  quizPacks,
  selectedPackId,
  onSelectPack,
  questionTime,
  onSelectTime,
  holdDuration,
  onSelectHoldDuration,
  onStartGame,
  onOpenQuestionEditor,
  tracker,
  poseData,
  highScore,
}) => {
  const currentPack = quizPacks.find((p) => p.id === selectedPackId) || quizPacks[0];

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between p-4 sm:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 overflow-y-auto">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with High Score & Brand kicker */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Interactive Head-Motion Quiz</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenQuestionEditor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Chỉnh Sửa Câu Hỏi</span>
          </button>

          {highScore > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Kỷ Lục: {highScore.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Center Content: Title Lockup & Interactive Camera Preview */}
      <div className="w-full max-w-6xl mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Col: Bespoke Title Lockup & Config */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6">
          {/* Bespoke SVG Title Lockup */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Webcam Motion Experience
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
              NGHIÊNG ĐẦU <br />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
                CHỌN ĐÚNG
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed pt-1">
              Nhìn vào webcam và nghiêng đầu sang trái hoặc phải để chốt đáp án! Giữ nghiêng {holdDuration} giây để hệ thống tự động ghi nhận câu trả lời.
            </p>
          </div>

          {/* Quiz Pack Selection Grid */}
          <div className="w-full space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>1. Chọn Bộ Câu Hỏi ({quizPacks.length})</span>
              <button
                onClick={onOpenQuestionEditor}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Quản lý & Chỉnh sửa ({currentPack.questions.length} câu)
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 w-full">
              {quizPacks.map((pack) => {
                const isSelected = pack.id === selectedPackId;
                return (
                  <button
                    key={pack.id}
                    onClick={() => onSelectPack(pack.id)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/50'
                        : 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{pack.icon}</span>
                      <span className="font-bold text-sm text-white truncate">{pack.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {pack.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Game Settings: Hold Time & Question Duration */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hold Duration Setting (Default 4s) */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-sky-400" />
                Thời Gian Giữ Nghiêng Đầu
              </span>
              <div className="flex items-center gap-1.5">
                {[1.5, 2, 3, 4].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onSelectHoldDuration(sec)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                      holdDuration === sec
                        ? 'bg-sky-600 text-white shadow-md ring-1 ring-sky-400'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {sec}s {sec === 2 && '★'}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-400 block">
                Nghiêng 1 bên {holdDuration} giây để tự động chốt đáp án
              </span>
            </div>

            {/* Time Limit Setting */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Thời Gian Tối Đa Mỗi Câu
              </span>
              <div className="flex items-center gap-1.5">
                {[10, 15, 20].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onSelectTime(sec)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                      questionTime === sec
                        ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-400 block">
                Thời gian suy nghĩ và thực hiện nghiêng đầu
              </span>
            </div>
          </div>

          {/* Big Start CTA */}
          <div className="w-full pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onStartGame}
              className="flex-1 py-4 px-8 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-600 hover:from-indigo-500 hover:to-sky-500 shadow-[0_0_35px_rgba(79,70,229,0.45)] hover:shadow-[0_0_45px_rgba(79,70,229,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>BẮT ĐẦU CHƠI NGAY</span>
            </button>
          </div>
        </div>

        {/* Right Col: Live Camera Calibration & Practice Area */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm flex flex-col items-center space-y-3">
            <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Thử Nghiệm Cảm Biến Nghiêng</span>
              <span className="text-emerald-400 font-mono">Camera Trực Tiếp</span>
            </div>

            {/* Camera View Box */}
            <CameraView
              tracker={tracker}
              poseData={poseData}
              selectedDirection={poseData?.direction || 'center'}
              className="w-full aspect-[4/3]"
            />

            {/* Test Feedback Hints */}
            <div className="w-full grid grid-cols-2 gap-2 text-center text-xs">
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  poseData?.direction === 'left'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold scale-105'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Nghiêng Trái</span>
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  poseData?.direction === 'right'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold scale-105'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Nghiêng Phải</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-normal">
              Thử nghiêng đầu sang 2 bên để kiểm tra trước khi chơi. Bạn có thể nhấn nút ↻ trên camera để căn vị trí thẳng.
            </p>
          </div>
        </div>
      </div>

      {/* Flat Game Control Hint Line (Mandated by Game Craft Constitution) */}
      <div className="w-full max-w-6xl mx-auto pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400 font-medium tracking-wide z-10">
        <span>◄ Nghiêng Trái / Phím Trái · Nghiêng Phải / Phím Phải ► · Giữ {holdDuration}s Chốt Đáp Án · Space Bắt Đầu · Esc Tạm Dừng</span>
      </div>
    </div>
  );
};
