import React, { useState, useEffect } from 'react';
import { gameEvents, GAME_EVENTS, ChallengeTimerData } from '../game/events/GameEvents';
import { Clock, Zap } from 'lucide-react';

interface ChallengeTimerHUDProps {
  initialRemaining?: number;
  total?: number;
}

export const ChallengeTimerHUD: React.FC<ChallengeTimerHUDProps> = ({
  initialRemaining = 60.0,
  total = 60.0
}) => {
  const [remaining, setRemaining] = useState<number>(initialRemaining);
  const [bonusText, setBonusText] = useState<string | null>(null);

  useEffect(() => {
    const offTimer = gameEvents.on<ChallengeTimerData>(
      GAME_EVENTS.CHALLENGE_TIMER_UPDATE,
      (data) => {
        setRemaining(data.remaining);
      }
    );

    const offBonus = gameEvents.on<ChallengeTimerData>(
      GAME_EVENTS.CHALLENGE_TIMER_BONUS,
      (data) => {
        setRemaining(data.remaining);
        if (data.bonusAdded) {
          setBonusText(`+${data.bonusAdded.toFixed(1)}s`);
          const timer = setTimeout(() => {
            setBonusText(null);
          }, 1100);
          return () => clearTimeout(timer);
        }
      }
    );

    return () => {
      offTimer();
      offBonus();
    };
  }, []);

  const isLowTime = remaining <= 10.0;
  const progressPercent = Math.min(100, Math.max(0, (remaining / total) * 100));

  return (
    <div className="relative flex flex-col items-center">
      {/* Floating Bonus Indicator */}
      {bonusText && (
        <div className="absolute -top-7 animate-bounce rounded-full border border-emerald-400/50 bg-emerald-950/90 px-2.5 py-0.5 text-xs font-black text-emerald-300 font-game shadow-[0_0_15px_rgba(52,211,153,0.4)]">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-emerald-400" />
            {bonusText}
          </span>
        </div>
      )}

      {/* Main Timer Capsule */}
      <div
        className={`flex items-center gap-2 rounded-2xl border px-3.5 py-1.5 backdrop-blur-md transition-all duration-300 ${
          isLowTime
            ? 'border-rose-500/80 bg-rose-950/80 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.5)] animate-pulse'
            : 'border-amber-400/40 bg-slate-950/80 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
        }`}
      >
        <Clock
          className={`h-4 w-4 ${
            isLowTime ? 'text-rose-400 animate-spin' : 'text-amber-300'
          }`}
          style={isLowTime ? { animationDuration: '2s' } : undefined}
        />

        <div className="flex flex-col items-start leading-none">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-game font-bold">
            TIME ATTACK
          </span>
          <span className="font-game text-base sm:text-lg font-black tracking-wide">
            {remaining.toFixed(1)}s
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="ml-1 h-8 w-1.5 overflow-hidden rounded-full bg-slate-800 border border-white/10 flex flex-col justify-end">
          <div
            className={`w-full transition-all duration-100 ease-linear ${
              isLowTime ? 'bg-rose-500' : 'bg-gradient-to-t from-amber-400 to-yellow-200'
            }`}
            style={{ height: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

