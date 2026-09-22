import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, X, Volume2 } from 'lucide-react';
import { Button } from './Button';

interface RestTimerProps {
  initialSeconds: number;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  // Sound beep using native Web Audio API
  const playBeep = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio autoplay may be restricted, fail silently
    }
  }, []);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds, isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isOpen && isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isOpen) {
      playBeep();
      if (onComplete) onComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isRunning, timeLeft, onComplete, playBeep]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const progress = initialSeconds > 0 ? ((initialSeconds - timeLeft) / initialSeconds) * 100 : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 sm:p-6 pointer-events-none animate-slide-up">
      <div className="pointer-events-auto w-full max-w-md bg-slate-900/95 text-white border border-emerald-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col items-center">
        {/* Top header */}
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Volume2 className="w-4 h-4 animate-pulse" />
            Descanso entre séries
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big digits */}
        <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight my-2 text-emerald-400">
          {formatted}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-5">
          <div
            className="bg-emerald-500 h-full transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Quick adjustments and controls */}
        <div className="flex items-center justify-between w-full gap-2">
          <button
            onClick={() => setTimeLeft((prev) => Math.max(0, prev - 15))}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" /> 15s
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/30"
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                setTimeLeft(initialSeconds);
                setIsRunning(true);
              }}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setTimeLeft((prev) => prev + 15)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> 15s
          </button>
        </div>

        {/* Finish rest button */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-xs text-slate-400 hover:text-white"
          onClick={onClose}
        >
          Pular descanso e ir para próxima série
        </Button>
      </div>
    </div>
  );
};
