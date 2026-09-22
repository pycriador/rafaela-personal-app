import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Film, Gauge } from 'lucide-react';
import { getAssetUrl } from '../../utils/assets';

export interface ExerciseFramePlayerProps {
  frames?: string[];
  fallbackImage?: string;
  title?: string;
  autoPlay?: boolean;
  compact?: boolean;
  className?: string;
  defaultSpeed?: 'normal' | 'slow' | 'fast';
}

const SPEED_MAP = {
  slow: 800,
  normal: 500,
  fast: 300,
};

export const ExerciseFramePlayer: React.FC<ExerciseFramePlayerProps> = ({
  frames,
  fallbackImage = '/exercises/exercise-peito-01.png',
  title = 'Exercício',
  autoPlay = false,
  compact = false,
  className = '',
  defaultSpeed = 'normal',
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>(defaultSpeed);
  const intervalRef = useRef<number | null>(null);

  const rawFrames = frames && frames.length > 0 ? frames : [fallbackImage];
  const validFrames = rawFrames.map((f) => getAssetUrl(f));
  const hasMultipleFrames = validFrames.length > 1;

  // Preload frames in memory for smooth, flicker-free playback
  useEffect(() => {
    if (validFrames && validFrames.length > 1) {
      validFrames.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [validFrames]);

  // Frame animation loop
  useEffect(() => {
    if (!isPlaying || !hasMultipleFrames) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const intervalMs = SPEED_MAP[speed];

    intervalRef.current = window.setInterval(() => {
      setCurrentFrameIdx((prev) => {
        if (prev >= validFrames.length - 1) {
          setDirection(-1);
          return Math.max(0, validFrames.length - 2);
        } else if (prev <= 0) {
          setDirection(1);
          return Math.min(validFrames.length - 1, 1);
        } else {
          return prev + direction;
        }
      });
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, direction, speed, hasMultipleFrames, validFrames.length]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultipleFrames) return;
    setIsPlaying((prev) => !prev);
  };

  const handleFrameSelect = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setCurrentFrameIdx(idx);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeed((prev) => {
      if (prev === 'normal') return 'fast';
      if (prev === 'fast') return 'slow';
      return 'normal';
    });
  };

  const resetAnimation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setCurrentFrameIdx(0);
    setDirection(1);
  };

  const activeSrc = validFrames[currentFrameIdx] || getAssetUrl(fallbackImage);

  if (compact) {
    return (
      <div
        className={`relative group bg-slate-900 overflow-hidden rounded-2xl flex items-center justify-center select-none ${className}`}
        onClick={hasMultipleFrames ? togglePlay : undefined}
      >
        {/* SVG Display */}
        <img
          src={activeSrc}
          alt={`${title} - frame ${currentFrameIdx + 1}`}
          className="w-full h-full object-contain p-2 filter drop-shadow-md transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />

        {/* Mini video indicator badge */}
        {hasMultipleFrames && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white/90">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
            {isPlaying ? 'ANIMANDO' : 'MINI VÍDEO'}
          </div>
        )}

        {/* Play/Pause Button Overlay */}
        {hasMultipleFrames && (
          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? 'Pausar animação' : 'Executar animação'}
            className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
              isPlaying
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-black/70 hover:bg-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 border border-white/20'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
        )}

        {/* Frame Progress Bar */}
        {hasMultipleFrames && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            {validFrames.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === currentFrameIdx
                    ? 'w-4 bg-emerald-400'
                    : 'w-1 bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl flex flex-col items-center justify-between ${className}`}
    >
      {/* Top Bar with Info Badge and Speed Toggle */}
      <div className="w-full p-3 sm:p-4 pb-2 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Film className="w-3.5 h-3.5" />
            Loop de Execução
          </span>
          {hasMultipleFrames && (
            <span className="text-[11px] font-mono text-slate-400">
              Frame {currentFrameIdx + 1} de {validFrames.length}
            </span>
          )}
        </div>

        {hasMultipleFrames && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycleSpeed}
              title="Ajustar velocidade da execução"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors"
            >
              <Gauge className="w-3 h-3 text-emerald-400" />
              <span>
                {speed === 'slow' && '0.5x'}
                {speed === 'normal' && '1x'}
                {speed === 'fast' && '1.5x'}
              </span>
            </button>
            <button
              type="button"
              onClick={resetAnimation}
              title="Reiniciar animação"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Vector Stage */}
      <div className="relative w-full h-48 sm:h-60 max-h-[250px] flex items-center justify-center p-2 sm:p-3 overflow-hidden">
        {/* Subtle radial spotlight backdrop */}
        <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />

        <img
          src={activeSrc}
          alt={`${title} - frame ${currentFrameIdx + 1}`}
          className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] z-0 select-none"
        />
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full p-3 pt-2 border-t border-white/10 bg-slate-950/60 backdrop-blur-md flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 z-10 shrink-0">
        {/* Step indicators / Scrubber */}
        <div className="flex items-center gap-2">
          {hasMultipleFrames &&
            validFrames.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleFrameSelect(idx, e)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  idx === currentFrameIdx
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>Fase {idx + 1}</span>
                {idx === 0 && <span className="text-[10px] opacity-70">(Início)</span>}
                {idx === 1 && <span className="text-[10px] opacity-70">(Transição)</span>}
                {idx === 2 && <span className="text-[10px] opacity-70">(Pico)</span>}
              </button>
            ))}
        </div>

        {/* Master Play/Pause Button */}
        {hasMultipleFrames && (
          <button
            type="button"
            onClick={togglePlay}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg select-none ${
              isPlaying
                ? 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600'
                : 'bg-white text-slate-900 hover:bg-slate-100 shadow-white/10'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Executar Movimento</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
