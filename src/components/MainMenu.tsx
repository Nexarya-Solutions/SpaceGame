import React from 'react';
import { GameMode } from '../game/events/GameEvents';
import shivoroLogo from '../assets/shivoro-games-cropped.png';
import {
  Play,
  Trophy,
  Flame,
  Sparkles,
  Clock,
  Compass,
  Zap,
  Radio
} from 'lucide-react';

interface MainMenuProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  regularHighScore: number;
  challengeHighScore: number;
  onStart: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  currentMode,
  onSelectMode,
  regularHighScore,
  challengeHighScore,
  onStart
}) => {
  return (
    <div className="pointer-events-auto my-auto flex w-full flex-col items-center justify-center px-4 py-2 text-center overflow-hidden">
      <div className="relative w-full max-w-[335px] rounded-3xl border border-white/15 bg-slate-950/90 p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-hidden">
        {/* Comet Symbol Badge: Polished Single Red Dot with Specular Sheen (No Blinking) */}
        <div className="relative mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 p-1.5 shadow-sm">
          {/* Outer soft ambient glow */}
          <div className="h-7 w-7 rounded-full bg-red-600/20 flex items-center justify-center">
            {/* Clean, solid single red dot */}
            <div className="relative h-4 w-4 rounded-full bg-[#ee2244] border border-[#990022]">
              {/* Glossy specular highlight */}
              <span className="absolute top-0.5 left-0.5 h-1 w-1 rounded-full bg-white/90" />
            </div>
          </div>
        </div>

        {/* Shivoro Games Production Credit */}
        <div className="mb-1 flex items-center justify-center gap-1.5">
          <img src={shivoroLogo} alt="Shivoro Games" className="h-3.5 w-3.5 rounded-sm object-contain" />
          <span className="font-game text-[9px] tracking-[0.2em] text-amber-300 font-bold uppercase">
            SHIVORO GAMES
          </span>
        </div>

        {/* Game Title - Simple clean solid text, no glow */}
        <h1 className="font-game text-2xl sm:text-3xl font-black tracking-wider text-white">
          ENDLESS ORBIT
        </h1>
        <p className="font-game text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-400 uppercase">
          CELESTIAL TRAJECTORY ARCADE
        </p>

        {/* Mode Selection Tabs */}
        <div className="mt-2.5 mb-2 grid grid-cols-2 gap-1.5 rounded-2xl bg-white/5 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => onSelectMode('REGULAR')}
            className={`flex flex-col items-center justify-center rounded-xl py-1.5 px-2 transition-all ${
              currentMode === 'REGULAR'
                ? 'bg-sky-600/40 border border-sky-400/60 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1">
              <Compass className="h-3 w-3 text-sky-300" />
              <span className="font-game text-xs font-bold tracking-wide">REGULAR</span>
            </div>
            <span className="mt-0.5 font-game text-[9px] text-sky-200 font-semibold">
              BEST: {regularHighScore}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('DAILY_CHALLENGE')}
            className={`flex flex-col items-center justify-center rounded-xl py-1.5 px-2 transition-all ${
              currentMode === 'DAILY_CHALLENGE'
                ? 'bg-amber-600/40 border border-amber-400/60 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-amber-300" />
              <span className="font-game text-xs font-bold tracking-wide">CHALLENGE</span>
            </div>
            <span className="mt-0.5 font-game text-[9px] text-amber-200 font-semibold">
              BEST: {challengeHighScore}
            </span>
          </button>
        </div>

        {/* Selected Mode Summary Card */}
        {currentMode === 'REGULAR' ? (
          <div className="rounded-xl border border-sky-500/20 bg-sky-950/25 p-2.5 text-left font-rajdhani text-xs mb-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-game text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                Endless Celestial Mode
              </span>
              <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[9px] font-bold text-sky-200 font-game">
                CLASSIC
              </span>
            </div>
            <p className="text-slate-300 text-[10px] leading-snug">
              Calm star progression across deep cosmos. Collect 2x cores and chain warps.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/25 p-2.5 text-left font-rajdhani text-xs mb-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-game text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" /> 60s Time Attack
              </span>
              <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[9px] font-bold text-rose-200 font-game">
                HARDCORE
              </span>
            </div>
            <p className="text-slate-300 text-[10px] leading-snug">
              Decaying stars, repulsor nodes & vertical oscillation. Snapping adds +2.5s!
            </p>
          </div>
        )}

        {/* Start Button: Exactly "START", on click starts orbiting without launching */}
        <div className="my-2">
          <button
            onClick={onStart}
            className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-white text-[#1c1c1e] py-3 px-6 font-game text-base font-black tracking-wider shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>START</span>
          </button>
        </div>

        {/* Clear Visual Instructions */}
        <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs font-rajdhani text-left">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-white/10 text-white text-[9px] font-bold">1</span>
            <span className="text-[10px]"><strong>Tap screen:</strong> Launch along orbit tangent</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-white/10 text-white text-[9px] font-bold">2</span>
            <span className="text-[10px]"><strong>Gravity capture:</strong> Snaps into next orbit</span>
          </div>
          <div className="flex items-center gap-2 text-amber-200">
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-bold">★</span>
            <span className="text-[10px]"><strong>Pickups:</strong> 2x Multiplier cores & Chain warps</span>
          </div>
          <div className="flex items-center gap-2 text-rose-300">
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-bold">!</span>
            <span className="text-[10px]"><strong>Hazards:</strong> Molten stars & debris</span>
          </div>
        </div>
      </div>
    </div>
  );
};

