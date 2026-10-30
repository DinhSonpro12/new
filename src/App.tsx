/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { CameraView } from './components/CameraView';
import { QuestionCard } from './components/QuestionCard';
import { HudHeader } from './components/HudHeader';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { QuestionEditorModal } from './components/QuestionEditorModal';
import { ResizableCameraDock } from './components/ResizableCameraDock';
import { DEFAULT_QUIZ_PACKS, Question, QuizPack } from './questions';
import { HeadPoseData, HeadTracker } from './headTracker';
import { sound } from './soundEffects';

type GameState = 'title' | 'playing' | 'paused' | 'game_over';

interface AnswerHistory {
  question: Question;
  userChoice: 'left' | 'right' | 'timeout';
  isCorrect: boolean;
}

const STORAGE_KEY_PACKS = 'head_tilt_quiz_packs_v2';
const STORAGE_KEY_HIGH_SCORE = 'head_tilt_high_score';

export default function App() {
  // Game lifecycle state
  const [gameState, setGameState] = useState<GameState>('title');
  const [quizPacks, setQuizPacks] = useState<QuizPack[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_PACKS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_QUIZ_PACKS;
  });

  const [selectedPackId, setSelectedPackId] = useState<string>(DEFAULT_QUIZ_PACKS[0].id);
  const [questionTime, setQuestionTime] = useState<number>(12); // 12 seconds per question
  const [holdDuration, setHoldDuration] = useState<number>(2); // Default exactly 2 seconds as requested!
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_HIGH_SCORE);
      return saved ? parseInt(saved, 10) || 0 : 0;
    }
    return 0;
  });

  // Active game session state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [selectedDirection, setSelectedDirection] = useState<'left' | 'right' | 'center'>('center');
  const [lockProgress, setLockProgress] = useState<number>(0);
  const [isLockedIn, setIsLockedIn] = useState<boolean>(false);
  const [revealResult, setRevealResult] = useState<boolean>(false);
  const [history, setHistory] = useState<AnswerHistory[]>([]);
  const [showQuestionEditor, setShowQuestionEditor] = useState<boolean>(false);

  // Tracker instance
  const trackerRef = useRef<HeadTracker>(new HeadTracker());
  const [poseData, setPoseData] = useState<HeadPoseData | null>(null);

  // Active questions list
  const currentPack = quizPacks.find((p) => p.id === selectedPackId) || quizPacks[0];
  const activeQuestions = currentPack?.questions || DEFAULT_QUIZ_PACKS[0].questions;
  const currentQuestion: Question | undefined = activeQuestions[currentQuestionIndex];

  // Head tracking listener
  useEffect(() => {
    const tracker = trackerRef.current;
    tracker.onPose((data) => {
      setPoseData(data);
    });
  }, []);

  // Sync mute state
  const handleToggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  // Hold timing with true physical wall-clock timestamp precision
  const holdStartTimeRef = useRef<number | null>(null);
  const activeTiltSideRef = useRef<'left' | 'right' | 'center'>('center');
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound and selection when head tilts
  useEffect(() => {
    if (!poseData || gameState !== 'playing' || revealResult || isLockedIn) return;

    const dir = poseData.direction;

    if (dir === 'left' || dir === 'right') {
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
        graceTimerRef.current = null;
      }

      if (activeTiltSideRef.current !== dir) {
        activeTiltSideRef.current = dir;
        holdStartTimeRef.current = performance.now();
        setSelectedDirection(dir);
        setLockProgress(0);
        sound.playTilt(dir);
      }
    } else {
      // Head is in center
      if (activeTiltSideRef.current !== 'center' && !graceTimerRef.current) {
        // 150ms grace window so natural micro-tremor doesn't abort the 2s hold
        graceTimerRef.current = setTimeout(() => {
          activeTiltSideRef.current = 'center';
          holdStartTimeRef.current = null;
          setSelectedDirection('center');
          setLockProgress(0);
          graceTimerRef.current = null;
        }, 150);
      }
    }
  }, [poseData, gameState, revealResult, isLockedIn]);

  // Lock-in resolution handler
  const lockInAnswer = useCallback(
    (chosenDirection: 'left' | 'right' | 'timeout') => {
      if (revealResult || !currentQuestion) return;

      setIsLockedIn(true);
      setRevealResult(true);

      // Reset hold timers
      holdStartTimeRef.current = null;
      activeTiltSideRef.current = 'center';
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
        graceTimerRef.current = null;
      }

      const isCorrect = chosenDirection !== 'timeout' && currentQuestion.correct === chosenDirection;

      if (isCorrect) {
        sound.playCorrect();
        const streakBonus = streak * 50;
        const timeBonus = Math.round(timeLeft * 15);
        const earned = 100 + streakBonus + timeBonus;

        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setMaxStreak((prev) => Math.max(prev, nextStreak));
        setScore((prev) => prev + earned);

        if (nextStreak === 3 || nextStreak === 5 || nextStreak === 10) {
          setTimeout(() => sound.playStreak(), 200);
        }
      } else {
        sound.playWrong();
        setStreak(0);
      }

      setHistory((prev) => [
        ...prev,
        {
          question: currentQuestion,
          userChoice: chosenDirection,
          isCorrect,
        },
      ]);

      // Move to next question after reveal delay
      setTimeout(() => {
        if (currentQuestionIndex + 1 < activeQuestions.length) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setTimeLeft(questionTime);
          setSelectedDirection('center');
          setLockProgress(0);
          setIsLockedIn(false);
          setRevealResult(false);
          activeTiltSideRef.current = 'center';
          holdStartTimeRef.current = null;
        } else {
          // Game Completed!
          setGameState('game_over');
        }
      }, 1900);
    },
    [revealResult, currentQuestion, streak, timeLeft, currentQuestionIndex, activeQuestions.length, questionTime]
  );

  // Precise 60fps simulation tick for Timer countdown & exact wall-clock hold timing
  useEffect(() => {
    if (gameState !== 'playing' || revealResult || isLockedIn) return;

    let animId: number;
    let lastTick = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTick) / 1000;
      lastTick = now;

      // Decrement countdown timer
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - dt);
        if (next <= 0) {
          const finalChoice = activeTiltSideRef.current === 'center' ? 'timeout' : activeTiltSideRef.current;
          lockInAnswer(finalChoice);
          return 0;
        }

        // Ticking audio when urgent (under 3 seconds)
        if (Math.floor(next * 2) !== Math.floor(prev * 2) && next <= 3 && next > 0) {
          sound.playTick(1.2);
        }

        return next;
      });

      // EXACT WALL-CLOCK PHYSICAL HOLD MEASUREMENT
      if (activeTiltSideRef.current === 'left' || activeTiltSideRef.current === 'right') {
        if (holdStartTimeRef.current !== null) {
          const elapsed = (now - holdStartTimeRef.current) / 1000;
          const progress = Math.min(1, elapsed / holdDuration);
          setLockProgress(progress);

          if (elapsed >= holdDuration) {
            const side = activeTiltSideRef.current;
            holdStartTimeRef.current = null;
            activeTiltSideRef.current = 'center';
            lockInAnswer(side);
            return;
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, revealResult, isLockedIn, holdDuration, lockInAnswer]);

  // Save High Score on game over
  useEffect(() => {
    if (gameState === 'game_over') {
      if (score > highScore) {
        setHighScore(score);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_HIGH_SCORE, String(score));
        }
      }
    }
  }, [gameState, score, highScore]);

  // Global Keyboard Controls (Left/Right tilt, Space to start/retry, Esc to pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore typing inside inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        if (gameState === 'title') {
          sound.playClick();
          handleStartGame();
        } else if (gameState === 'game_over') {
          sound.playClick();
          handleRestart();
        } else if (gameState === 'paused') {
          sound.playClick();
          setGameState('playing');
        }
      } else if (e.code === 'Escape') {
        if (gameState === 'playing') {
          sound.playClick();
          setGameState('paused');
        } else if (gameState === 'paused') {
          sound.playClick();
          setGameState('playing');
        }
      } else if (gameState === 'playing' && !revealResult && !isLockedIn) {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          e.preventDefault();
          if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
          activeTiltSideRef.current = 'left';
          holdStartTimeRef.current = performance.now();
          setSelectedDirection('left');
          setLockProgress(0);
          sound.playTilt('left');
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          e.preventDefault();
          if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
          activeTiltSideRef.current = 'right';
          holdStartTimeRef.current = performance.now();
          setSelectedDirection('right');
          setLockProgress(0);
          sound.playTilt('right');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, revealResult, isLockedIn]);

  // Game start
  const handleStartGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(questionTime);
    setSelectedDirection('center');
    setLockProgress(0);
    setIsLockedIn(false);
    setRevealResult(false);
    setHistory([]);
    activeTiltSideRef.current = 'center';
    holdStartTimeRef.current = null;
    if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    setGameState('playing');
  };

  // Restart
  const handleRestart = () => {
    handleStartGame();
  };

  // Go to Home
  const handleGoHome = () => {
    setGameState('title');
  };

  // Manual touch/click selection fallback
  const handleSelectManual = (dir: 'left' | 'right') => {
    if (revealResult || isLockedIn) return;
    sound.playTilt(dir);
    setSelectedDirection(dir);
    // Instant lock on intentional button click
    lockInAnswer(dir);
  };

  // Update and persist quiz packs (from question editor)
  const handleUpdatePacks = (updated: QuizPack[], newSelectedId?: string) => {
    setQuizPacks(updated);
    if (newSelectedId) {
      setSelectedPackId(newSelectedId);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PACKS, JSON.stringify(updated));
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif] text-slate-100 flex flex-col">
      {/* Title Screen View */}
      {gameState === 'title' && (
        <TitleScreen
          quizPacks={quizPacks}
          selectedPackId={selectedPackId}
          onSelectPack={setSelectedPackId}
          questionTime={questionTime}
          onSelectTime={setQuestionTime}
          holdDuration={holdDuration}
          onSelectHoldDuration={setHoldDuration}
          onStartGame={handleStartGame}
          onOpenQuestionEditor={() => setShowQuestionEditor(true)}
          tracker={trackerRef.current}
          poseData={poseData}
          highScore={highScore}
        />
      )}

      {/* Playing Screen View */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950">
          {/* Top HUD Cluster */}
          <HudHeader
            score={score}
            streak={streak}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={activeQuestions.length}
            timeLeft={timeLeft}
            totalTime={questionTime}
            holdDuration={holdDuration}
            onChangeHoldDuration={setHoldDuration}
            onPause={() => setGameState('paused')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />

          {/* Main Playfield: Low-occlusion question and choices */}
          <main className="flex-1 min-h-0 w-full max-w-5xl mx-auto flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto relative z-10">
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                selectedDirection={selectedDirection}
                isLockedIn={isLockedIn}
                revealResult={revealResult}
                lockProgress={lockProgress}
                holdDuration={holdDuration}
                onSelectManual={handleSelectManual}
              />
            )}
          </main>

          {/* Bottom Perimeter: Resizable Webcam Dock + Instructions */}
          <div className="w-full px-3 sm:px-5 py-2 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 flex items-end justify-between gap-3 z-20 flex-shrink-0">
            {/* Control hints & Status */}
            <div className="flex-1 py-1 text-[11px] sm:text-xs text-slate-400 font-medium flex flex-col justify-end gap-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-[10px] sm:text-[11px]">
                  Điều khiển bằng nghiêng đầu
                </span>
                <span className="text-sky-300 font-semibold">
                  Giữ yên {holdDuration}s để tự động chốt đáp án
                </span>
              </div>
              <div className="text-slate-400 text-[10px] sm:text-[11px] leading-relaxed truncate sm:text-clip">
                <span>Nghiêng Trái ◄ hoặc Phải ► · Dự phòng: Phím </span>
                <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[10px]">◄</kbd>{' '}
                <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[10px]">►</kbd>
                <span> hoặc nhấn chuột trực tiếp</span>
              </div>
            </div>

            {/* Resizable Camera Dock (Default 250px x 250px, corner drag resize & presets) */}
            <ResizableCameraDock
              tracker={trackerRef.current}
              poseData={poseData}
              selectedDirection={selectedDirection}
              isLockedIn={isLockedIn}
            />
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={() => setGameState('playing')}
          onRestart={handleRestart}
          onQuit={handleGoHome}
          holdDuration={holdDuration}
          onChangeHoldDuration={setHoldDuration}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Game Over / Victory Modal */}
      {gameState === 'game_over' && (
        <GameOverModal
          summary={{
            score,
            totalQuestions: activeQuestions.length,
            correctAnswers: history.filter((h) => h.isCorrect).length,
            maxStreak,
            history,
          }}
          highScore={highScore}
          onPlayAgain={handleRestart}
          onGoHome={handleGoHome}
        />
      )}

      {/* Full Question Management & Editor Modal */}
      {showQuestionEditor && (
        <QuestionEditorModal
          quizPacks={quizPacks}
          selectedPackId={selectedPackId}
          onClose={() => setShowQuestionEditor(false)}
          onUpdatePacks={handleUpdatePacks}
        />
      )}
    </div>
  );
}
