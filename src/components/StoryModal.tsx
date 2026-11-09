import React from 'react';
import { Play, ArrowLeft, Sparkles, Compass, ShieldAlert } from 'lucide-react';
import shivoroLogo from '../assets/shivoro-games-cropped.png';

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
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl overflow-hidden select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-[340px] rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-black p-5 shadow-2xl flex flex-col justify-between overflow-hidden max-h-[86vh]"
      >
        {/* Header with Comet Spark */}
        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-2 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-slate-900">
            <div className="h-7 w-7 rounded-full bg-red-600/25 flex items-center justify-center">
              <div className="relative h-4 w-4 rounded-full bg-[#ee2244] border border-[#990022]">
                <span className="absolute top-0.5 left-0.5 h-1 w-1 rounded-full bg-white/95" />
              </div>
            </div>
          </div>

          <span className="font-game text-[11px] font-bold tracking-[0.2em] text-cyan-300 uppercase">
            {mode === 'FIRST_LAUNCH' ? 'PROLOGUE' : 'LORE ARCHIVE'}
          </span>
          {/* Simple clean text without glow */}
          <h2 className="mt-0.5 font-game text-2xl font-black tracking-wide text-white">
            ENDLESS ORBIT
          </h2>
          <p className="font-game text-[11px] tracking-wider text-slate-400 font-bold uppercase">
            A CELESTIAL SLINGSHOT ODYSSEY
          </p>
        </div>

        {/* Narrative Chapters - Concise & clean */}
        <div className="my-3 space-y-2 font-rajdhani text-left text-xs leading-relaxed">
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
            <span className="font-game text-[10px] font-bold text-amber-200 uppercase block mb-0.5">
              1. The Cosmic Collapse
            </span>
            <p className="text-slate-300 text-[11px] leading-snug">
              A sudden cosmic collapse shattered your home constellation into ancient stardust.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
            <span className="font-game text-[10px] font-bold text-rose-200 uppercase block mb-0.5">
              2. The Lone Red Spark
            </span>
            <p className="text-slate-300 text-[11px] leading-snug">
              Separated across deep space, you are a lone red spark searching for the path home.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
            <span className="font-game text-[10px] font-bold text-cyan-200 uppercase block mb-0.5">
              3. The Gravitational Void
            </span>
            <p className="text-slate-300 text-[11px] leading-snug">
              Slingshot along planetary gravity fields, dodge molten debris, and blaze across infinity.
            </p>
          </div>
        </div>

        {/* Action Buttons based on Mode */}
        <div className="mt-2 flex flex-col gap-2">
          {mode === 'FIRST_LAUNCH' ? (
            <>
              {/* Primary: Begin Journey */}
              <button
                onClick={onBeginJourney}
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-white text-[#1c1c1e] py-3 font-game text-sm font-black tracking-wider shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>BEGIN JOURNEY</span>
              </button>

              {/* Secondary: Skip */}
              <button
                onClick={onSkip}
                className="flex w-full items-center justify-center py-1 font-game text-[11px] font-bold tracking-wider text-slate-400 hover:text-white transition-colors"
              >
                SKIP TO MAIN MENU
              </button>
            </>
          ) : (
            /* Settings Mode: Return to Settings */
            <button
              onClick={onBackToSettings}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-white text-[#1c1c1e] py-3 font-game text-sm font-black tracking-wider shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            >
              <ArrowLeft className="h-4 w-4 stroke-[3]" />
              <span>BACK TO SETTINGS</span>
            </button>
          )}
        </div>

        {/* Production Credit */}
        <div className="mt-2 flex items-center justify-center gap-1.5 pt-1.5 border-t border-white/5 opacity-80">
          <img src={shivoroLogo} alt="Shivoro Games" className="h-3.5 w-3.5 rounded-sm object-contain" />
          <span className="font-game text-[9px] tracking-wider text-slate-400 uppercase">
            A Shivoro Games Production
          </span>
        </div>
      </div>
    </div>
  );
};

