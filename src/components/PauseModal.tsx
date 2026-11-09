import React from 'react';
import { GameMode } from '../game/events/GameEvents';
import { Play, LogOut, Trophy, Compass, Zap } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  altitude: number;
  combo: number;
  currentMode: GameMode;
  onResume: () => void;
  onEndGame: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  score,
  highScore,
  altitude,
  combo,
  currentMode,
  onResume,
  onEndGame
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Game Paused"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-hidden pointer-events-auto select-none"
    >
      <div className="relative w-full max-w-[325px] rounded-3xl border border-white/15 bg-slate-950/95 p-5 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center overflow-hidden">
        {/* Modern Pause Icon Badge */}
        <div className="relative mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 shadow-sm">
          <div className="flex h-5 w-5 items-center justify-center gap-1.5">
            <span className="h-4 w-1.5 rounded-full bg-amber-400" />
            <span className="h-4 w-1.5 rounded-full bg-amber-400" />
          </div>
        </div>

        {/* Studio / Game Subtitle */}
        <span className="font-game text-[10px] tracking-[0.2em] text-slate-400 font-bold uppercase mb-0.5">
          SHIVORO GAMES • {currentMode === 'DAILY_CHALLENGE' ? 'CHALLENGE' : 'ENDLESS'}
        </span>

        {/* Modal Title */}
        <h2 className="font-game text-2xl sm:text-3xl font-black tracking-wider text-white mb-3">
          GAME PAUSED
        </h2>

        {/* Current Stats Card */}
        <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-3.5 mb-4 flex flex-col items-center">
          <span className="font-game text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            CURRENT SCORE
          </span>
          <span className="font-game text-4xl sm:text-5xl font-black tracking-wide text-white mt-1 leading-none">
            {score.toLocaleString()}
          </span>

          <div className="mt-2.5 flex items-center justify-center gap-3 text-xs font-game text-slate-300">
            <span className="flex items-center gap-1 font-bold">
              <Trophy className="h-3.5 w-3.5 text-amber-300" /> BEST: {highScore.toLocaleString()}
            </span>
            {altitude > 0 && (
              <span className="flex items-center gap-1 font-bold">
                <Compass className="h-3.5 w-3.5 text-sky-300" /> {altitude}km
              </span>
            )}
          </div>

          {combo > 1 && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] font-game font-bold text-emerald-400">
              <Zap className="h-3 w-3" /> {combo}x ACTIVE COMBO
            </div>
          )}
        </div>

        {/* Button 1: Resume Game */}
        <button
          type="button"
          onClick={onResume}
          className="w-full rounded-2xl bg-white py-3.5 px-6 font-game text-lg font-black text-[#1e1e20] shadow-[0_4px_20px_rgba(255,255,255,0.15)] transition-transform active:scale-95 hover:scale-[1.02] flex items-center justify-center gap-2 mb-2.5"
        >
          <Play className="h-5 w-5 fill-current" />
          <span>RESUME GAME</span>
        </button>

        {/* Button 2: End Game */}
        <button
          type="button"
          onClick={onEndGame}
          className="w-full rounded-2xl border border-red-500/30 bg-red-950/40 py-3 px-6 font-game text-base font-bold text-red-200 transition-transform active:scale-95 hover:bg-red-900/50 flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>END GAME</span>
        </button>
      </div>
    </div>
  );
};

