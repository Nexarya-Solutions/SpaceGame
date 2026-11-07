import React from 'react';
import { Play, ArrowLeft, Sparkles, Compass, ShieldAlert } from 'lucide-react';

interface StoryModalProps {
  isOpen: boolean;
  mode: 'FIRST_LAUNCH' | 'SETTINGS';
  onBeginJourney: () => void;
  onSkip: () => void;
  onBackToSettings: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  isOpen,
  mode,
  onBeginJourney,
  onSkip,
  onBackToSettings
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-xl overflow-y-auto select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-md rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-black p-6 sm:p-7 shadow-[0_0_60px_rgba(238,34,68,0.2)] animate-[fadeIn_0.3s_ease-out]"
      >
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-32 w-48 rounded-full bg-red-600/15 blur-3xl" />

        {/* Header with Shiny Comet Spark */}
        <div className="relative flex flex-col items-center text-center">
          {/* Polished Single Red Comet Spark */}
          <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 via-slate-900 to-slate-950 shadow-[0_0_30px_rgba(238,34,68,0.35)]">
            {/* Outer soft aura */}
            <div className="h-8 w-8 rounded-full bg-red-600/25 flex items-center justify-center">
              {/* Solid clean red dot */}
              <div className="relative h-5 w-5 rounded-full bg-[#ee2244] shadow-[0_0_14px_rgba(238,34,68,0.8)] border border-[#990022]">
                {/* Glossy specular sheen highlight */}
                <span className="absolute top-0.5 left-0.5 h-1.5 w-1.5 rounded-full bg-white/95" />
              </div>
            </div>
            {/* Subtle corner sparkle */}
            <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-300 drop-shadow-[0_0_6px_#fbbf24]" />
          </div>

          <span className="font-orbitron text-[10px] sm:text-xs font-bold tracking-[0.25em] text-cyan-300 uppercase">
            {mode === 'FIRST_LAUNCH' ? 'PROLOGUE' : 'LORE ARCHIVE'}
          </span>
          <h2 className="mt-1 font-orbitron text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
            ENDLESS ORBIT
          </h2>
          <p className="font-rajdhani text-xs tracking-widest text-slate-400 font-semibold uppercase">
            A CELESTIAL SLINGSHOT ODYSSEY
          </p>
        </div>

        {/* Narrative Chapters */}
        <div className="my-5 space-y-3.5 font-rajdhani text-left text-sm leading-relaxed">
          {/* Chapter 1 */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <h3 className="font-orbitron text-[11px] font-bold tracking-wider text-amber-200 uppercase">
                The Cosmic Collapse
              </h3>
            </div>
            <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
              In the silent expanse of the outer cosmos, a sudden cataclysm shattered your ancestral constellation. Billions of ancient suns collapsed into stardust, leaving behind cold silence.
            </p>
          </div>

          {/* Chapter 2 */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              <h3 className="font-orbitron text-[11px] font-bold tracking-wider text-rose-200 uppercase">
                The Lone Red Spark
              </h3>
            </div>
            <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
              Separated from everything you knew, you are a solitary celestial spark—a single red comet drifting through the infinite dark. Your light is small, but your momentum is unbroken.
            </p>
          </div>

          {/* Chapter 3 */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <h3 className="font-orbitron text-[11px] font-bold tracking-wider text-cyan-200 uppercase">
                The Gravitational Path
              </h3>
            </div>
            <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
              Guided only by the gravity of abandoned ancient planets, you must slingshot from orbit to orbit across the deep void, dodge molten debris, and blaze a path back to the constellation.
            </p>
          </div>
        </div>

        {/* Quick Celestial Directives */}
        <div className="grid grid-cols-3 gap-2 py-1 text-center font-rajdhani text-[11px]">
          <div className="rounded-xl border border-white/10 bg-white/5 p-2">
            <Compass className="mx-auto mb-1 h-3.5 w-3.5 text-cyan-300" />
            <span className="font-bold text-white block">TAP TO LAUNCH</span>
            <span className="text-[10px] text-slate-400">Slingshot tangent</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-2">
            <Sparkles className="mx-auto mb-1 h-3.5 w-3.5 text-amber-300" />
            <span className="font-bold text-white block">GRAVITY LOCK</span>
            <span className="text-[10px] text-slate-400">Snap to planets</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-2">
            <ShieldAlert className="mx-auto mb-1 h-3.5 w-3.5 text-rose-300" />
            <span className="font-bold text-white block">AVOID HAZARDS</span>
            <span className="text-[10px] text-slate-400">Molten stars</span>
          </div>
        </div>

        {/* Action Buttons based on Mode */}
        <div className="mt-5 flex flex-col gap-2.5 pt-1">
          {mode === 'FIRST_LAUNCH' ? (
            <>
              {/* Primary: Begin Journey (Direct into game) */}
              <button
                onClick={onBeginJourney}
                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 py-3.5 font-orbitron text-xs sm:text-sm font-bold tracking-widest text-white shadow-[0_0_30px_rgba(238,34,68,0.4)] transition-all duration-300 hover:scale-[1.02] hover:border-white/50 active:scale-95"
              >
                <Play className="h-4 w-4 fill-white text-white transition-transform group-hover:scale-110" />
                <span>BEGIN JOURNEY</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              </button>

              {/* Secondary: Skip / Go to Menu */}
              <button
                onClick={onSkip}
                className="flex w-full items-center justify-center py-2 font-rajdhani text-xs font-semibold tracking-wider text-slate-400 hover:text-white transition-colors"
              >
                SKIP TO MAIN MENU
              </button>
            </>
          ) : (
            /* Settings Mode: Return to Settings */
            <button
              onClick={onBackToSettings}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-gradient-to-r from-slate-800 to-slate-700 py-3.5 font-orbitron text-xs font-bold tracking-widest text-white shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all hover:border-white/40 active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:-translate-x-1" />
              <span>BACK TO SETTINGS</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

