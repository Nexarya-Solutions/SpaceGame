import React, { useState, useEffect, useCallback, useRef } from 'react';
import shivoroLogo from '../assets/shivoro-games-cropped.png';
import { SoundManager } from '../game/audio/SoundManager';
import { Sparkles } from 'lucide-react';

interface ProductionSplashProps {
  onComplete: () => void;
}

export const ProductionSplash: React.FC<ProductionSplashProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'ENTER' | 'ACTIVE' | 'EXIT'>('ENTER');
  const completedRef = useRef(false);

  const handleFinish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback((e?: React.MouseEvent | React.TouchEvent | KeyboardEvent) => {
    if (e && 'stopPropagation' in e) {
      e.stopPropagation();
    }
    setPhase('EXIT');
    setTimeout(() => {
      handleFinish();
    }, 280);
  }, [handleFinish]);

  useEffect(() => {
    // Initial entrance sound
    try {
      SoundManager.playIntroSplashChord();
    } catch {
      // Audio fallback
    }

    // Sequence timing
    const enterTimer = setTimeout(() => {
      setPhase('ACTIVE');
    }, 80);

    const exitTimer = setTimeout(() => {
      setPhase('EXIT');
    }, 2600);

    const completeTimer = setTimeout(() => {
      handleFinish();
    }, 3100);

    // Keyboard skip listener (Space, Enter, Escape)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        e.preventDefault();
        handleSkip(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleFinish, handleSkip]);

  return (
    <div
      onClick={handleSkip}
      onTouchStart={handleSkip}
      className={`pointer-events-auto fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#070a14] select-none cursor-pointer transition-opacity duration-500 ease-out ${
        phase === 'ENTER' ? 'opacity-0' : phase === 'ACTIVE' ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Ambient Celestial Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center">
        {/* Soft Golden Radiant Aura */}
        <div
          className={`h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-gradient-to-tr from-amber-500/25 via-yellow-500/15 to-transparent blur-[110px] transition-all duration-1000 ${
            phase === 'ACTIVE' ? 'scale-110 opacity-100' : 'scale-90 opacity-40'
          }`}
        />
        {/* Subtle Starlight Depth */}
        <div className="absolute h-48 w-48 rounded-full bg-sky-400/10 blur-[80px]" />
      </div>

      {/* Top Placeholder for Vertical Balance */}
      <div className="h-8" />

      {/* Center Production Logo Presentation */}
      <div
        className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 ease-out ${
          phase === 'ACTIVE' ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-2 opacity-0'
        }`}
      >
        {/* Metallic Golden Halo Card Container */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Pulsing outer aura ring */}
          <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-r from-amber-400/30 via-yellow-300/20 to-amber-500/30 blur-xl opacity-75 animate-pulse" />

          {/* Logo Card Frame */}
          <div className="relative overflow-hidden rounded-[28px] border-2 border-amber-400/60 bg-gradient-to-b from-white/10 via-slate-900/90 to-black p-3.5 shadow-[0_0_50px_rgba(221,180,14,0.35)] backdrop-blur-2xl">
            {/* Shivoro Games Logo Image */}
            <img
              src={shivoroLogo}
              alt="Shivoro Games Logo"
              className="h-44 w-44 sm:h-52 sm:w-52 object-contain rounded-2xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            />

            {/* Shimmer Light Beam Sweep */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2.2s_infinite]" />
          </div>

          {/* Golden Sparkle Accents */}
          <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-amber-300 drop-shadow-[0_0_8px_#fbbf24] animate-bounce" />
          <Sparkles className="absolute -bottom-1 -left-2 h-4 w-4 text-amber-400/80 drop-shadow-[0_0_6px_#f59e0b]" />
        </div>

        {/* Company Title & Presentation Tagline */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-orbitron text-xl sm:text-2xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 drop-shadow-[0_2px_14px_rgba(251,191,36,0.4)]">
            SHIVORO GAMES
          </h1>
          <div className="flex items-center gap-2">
            <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-amber-400/60" />
            <span className="font-orbitron text-xs sm:text-sm font-bold tracking-[0.45em] text-slate-300 uppercase">
              PRESENTS
            </span>
            <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>
        </div>
      </div>

      {/* Bottom Skip Indicator */}
      <div className="relative z-10 flex flex-col items-center pb-3">
        <span className="font-rajdhani text-xs tracking-widest text-slate-500 uppercase transition-opacity duration-300 hover:text-slate-300">
          TAP ANYWHERE TO SKIP
        </span>
      </div>
    </div>
  );
};
