import React, { useState, useMemo } from 'react';
import { GameOverData } from '../game/events/GameEvents';
import { Share } from '@capacitor/share';
import {
  RotateCcw,
  Home,
  Share2,
  MessageCircle,
  Check,
  Trophy,
  Sparkles,
  Compass,
  Zap
} from 'lucide-react';

interface GameOverModalProps {
  data: GameOverData;
  onRestart: () => void;
  onHome: () => void;
  onOpenSettings?: () => void;
}

const MOTIVATIONAL_PHRASES = [
  'KEEP PUSHING!',
  'ALMOST THERE!',
  'STAY FOCUSED!',
  'RISE AGAIN!',
  "DON'T QUIT!"
];

const CONFETTI_PIECES = Array.from({ length: 24 }).map((_, i) => ({
  id: i,
  left: `${(i * 4.2 + 2) % 96}%`,
  delay: `${(i * 0.12) % 1.6}s`,
  duration: `${2.2 + (i % 4) * 0.35}s`,
  color: ['#f59e0b', '#38bdf8', '#ec4899', '#10b981', '#a855f7', '#fbbf24'][i % 6],
  size: 6 + (i % 5) * 2,
  rotate: (i * 47) % 360
}));

export const GameOverModal: React.FC<GameOverModalProps> = ({
  data,
  onRestart,
  onHome
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pick random 2-word phrase once on mount
  const motivationalPhrase = useMemo(() => {
    return MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
  }, []);

  const shareText = data.isNewHighScore
    ? `🌌 I just set a NEW HIGH SCORE of ${data.score.toLocaleString()} in Endless Orbit!\nCan you beat my orbit?\n\nDeveloped by Shivoro Games 🚀\n#EndlessOrbit #ShivoroGames #MobileGaming`
    : `🌌 I scored ${data.score.toLocaleString()} in Endless Orbit!\nCan you beat my orbit?\n\nDeveloped by Shivoro Games 🚀\n#EndlessOrbit #ShivoroGames #MobileGaming`;

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const canShare = await Share.canShare().catch(() => ({ value: false }));
      if (canShare?.value) {
        await Share.share({
          title: 'Endless Orbit High Score',
          text: shareText,
          dialogTitle: 'Share your Score'
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setToastMessage('COPIED TO CLIPBOARD!');
        setTimeout(() => setToastMessage(null), 2500);
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
      }
    } catch {
      await navigator.clipboard.writeText(shareText);
      setToastMessage('COPIED TO CLIPBOARD!');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={data.isNewHighScore ? 'New High Score!' : 'Game Over'}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-hidden pointer-events-auto select-none"
    >
      {/* Confetti Particle Burst for New High Score */}
      {data.isNewHighScore && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          {CONFETTI_PIECES.map((piece) => (
            <span
              key={piece.id}
              className="absolute top-0 animate-confetti-fall rounded-sm opacity-90 shadow-sm"
              style={{
                left: piece.left,
                width: `${piece.size}px`,
                height: `${piece.size * 0.65}px`,
                backgroundColor: piece.color,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
                transform: `rotate(${piece.rotate}deg)`
              }}
            />
          ))}
        </div>
      )}

      {/* Centered Modal Card Container (Consistent with PauseModal & MainMenu) */}
      <div className="relative z-10 w-full max-w-[335px] rounded-3xl border border-white/15 bg-slate-950/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center overflow-hidden">
        {/* Top Status Icon Badge */}
        {data.isNewHighScore ? (
          <div className="relative mx-auto mb-1.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/20 shadow-md">
            <Trophy className="h-6 w-6 text-amber-300 animate-bounce" />
          </div>
        ) : (
          <div className="relative mx-auto mb-1.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 shadow-sm">
            <div className="relative h-4 w-4 rounded-full bg-[#ee2244] border border-[#990022]">
              <span className="absolute top-0.5 left-0.5 h-1 w-1 rounded-full bg-white/90" />
            </div>
          </div>
        )}

        {/* Studio / Mode Subtitle */}
        <span className="font-game text-[10px] tracking-[0.2em] text-slate-400 font-bold uppercase mb-0.5">
          SHIVORO GAMES • {data.mode === 'DAILY_CHALLENGE' ? 'CHALLENGE' : 'ENDLESS'}
        </span>

        {/* Modal Title / Header */}
        <h2
          className={`font-game text-2xl sm:text-3xl font-black tracking-wider mb-1 leading-none ${
            data.isNewHighScore ? 'text-amber-300' : 'text-white'
          }`}
        >
          {data.isNewHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER'}
        </h2>

        {/* Motivational Quote / Celebration Badge */}
        {data.isNewHighScore ? (
          <div className="mb-2.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="font-game text-[11px] font-black tracking-widest text-amber-200 uppercase">
              STELLAR RECORD!
            </span>
          </div>
        ) : (
          <div className="mb-2.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="font-game text-xs font-black tracking-widest text-sky-300 uppercase">
              {motivationalPhrase}
            </span>
          </div>
        )}

        {/* Score Summary Card */}
        <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-3 mb-3 flex flex-col items-center">
          <span className="font-game text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            FINAL SCORE
          </span>
          <span className="font-game text-4xl sm:text-5xl font-black tracking-wide text-white mt-0.5 leading-none">
            {data.score.toLocaleString()}
          </span>

          <div className="mt-2 flex items-center justify-center gap-3 text-xs font-game text-slate-300">
            <span className="flex items-center gap-1 font-bold">
              <Trophy className="h-3.5 w-3.5 text-amber-300" />
              BEST: {data.highScore.toLocaleString()}
            </span>
            {data.orbitsCount > 0 && (
              <span className="flex items-center gap-1 font-bold">
                <Compass className="h-3.5 w-3.5 text-sky-300" />
                {data.orbitsCount * 10}m
              </span>
            )}
          </div>

          {data.maxCombo > 1 && (
            <div className="mt-1 flex items-center gap-1 text-[11px] font-game font-bold text-emerald-400">
              <Zap className="h-3 w-3" />
              {data.maxCombo}x MAX COMBO
            </div>
          )}
        </div>

        {/* Button 1: Play Again / Restart */}
        <button
          type="button"
          onClick={onRestart}
          className="w-full rounded-2xl bg-white py-3 px-6 font-game text-base sm:text-lg font-black text-[#1e1e20] shadow-[0_4px_20px_rgba(255,255,255,0.15)] transition-transform active:scale-95 hover:scale-[1.02] flex items-center justify-center gap-2 mb-2"
        >
          <RotateCcw className="h-5 w-5 stroke-[2.5]" />
          <span>PLAY AGAIN</span>
        </button>

        {/* Button 2: Home / Menu */}
        <button
          type="button"
          onClick={onHome}
          className="w-full rounded-2xl border border-white/15 bg-white/10 py-2.5 px-6 font-game text-sm sm:text-base font-bold text-slate-200 transition-transform active:scale-95 hover:bg-white/15 flex items-center justify-center gap-2 mb-2"
        >
          <Home className="h-4 w-4" />
          <span>HOME MENU</span>
        </button>

        {/* Social Sharing Row (WhatsApp & Instagram/Share) */}
        <div className="w-full grid grid-cols-2 gap-2 mt-0.5">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 py-2 px-3 font-game text-xs font-bold text-emerald-300 transition-transform active:scale-95 hover:bg-emerald-900/50 flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WHATSAPP</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="rounded-xl border border-pink-500/30 bg-pink-950/40 py-2 px-3 font-game text-xs font-bold text-pink-300 transition-transform active:scale-95 hover:bg-pink-900/50 flex items-center justify-center gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>SHARE</span>
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mt-1.5 text-center">
            <span className="inline-flex items-center gap-1 font-game text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-400/40 px-2.5 py-0.5 rounded-full shadow-lg">
              <Check className="h-3 w-3" />
              {toastMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
