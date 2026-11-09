import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Smartphone,
  Crown,
  Star,
  Award,
  Share2,
  Play,
  X,
  Home,
  Check,
  Send
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  onOpenStory: () => void;
  onReplaySplash: () => void;
  onShare: () => void;
  onClose: () => void;
  onExitHome?: () => void;
  isGameActive?: boolean;
  regularHighScore: number;
  challengeHighScore: number;
}

const APP_VERSION = 'Version 1.0.0';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  soundEnabled,
  onToggleSound,
  hapticsEnabled,
  onToggleHaptics,
  onOpenStory,
  onReplaySplash,
  onShare,
  onClose,
  onExitHome,
  isGameActive = false,
  regularHighScore,
  challengeHighScore
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setActiveTooltip(msg);
    setTimeout(() => setActiveTooltip(null), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="pointer-events-auto fixed inset-0 z-50 flex flex-col items-center justify-between p-4 bg-black/75 backdrop-blur-md overflow-hidden select-none"
    >
      {/* Background soft ambient bokeh lights matching Image 1 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] right-[15%] h-36 w-36 rounded-full bg-rose-500/10 blur-2xl" />
        <div className="absolute bottom-[20%] left-[10%] h-44 w-44 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* Spacer for vertical balance */}
      <div className="h-2 shrink-0" />

      {/* Main Settings Card: Exactly matching Image 1 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[92%] max-w-[330px] rounded-[32px] bg-[#1e1e20] border border-white/10 p-4 sm:p-5 shadow-2xl flex flex-col justify-between items-center text-center overflow-hidden my-auto max-h-[82vh]"
      >
        {/* Top Text Header (Chunky font, exactly as in Image 1) */}
        <div className="flex flex-col items-center">
          <span className="font-game text-xs tracking-wider text-slate-300">
            {APP_VERSION}
          </span>
          <h2 className="font-game text-sm sm:text-base font-bold text-white tracking-wide mt-0.5">
            Developed By Shivoro Games
          </h2>
          <p className="font-game text-[10px] sm:text-[11px] text-slate-400 tracking-wider">
            Published By Shivoro Games
          </p>
        </div>

        {/* Dynamic Tooltip / Action Feedback */}
        <div className="h-4 my-0.5 flex items-center justify-center">
          {activeTooltip && (
            <span className="font-game text-[10px] text-amber-300 bg-black/60 px-2.5 py-0.5 rounded-full border border-amber-300/30">
              {activeTooltip}
            </span>
          )}
        </div>

        {/* Center Cluster of 7 Circular Buttons (Exactly as in Image 1) */}
        <div className="flex flex-col items-center gap-2.5 sm:gap-3 my-1">
          {/* Row 1: 2 Buttons (Sound FX & Haptics) */}
          <div className="flex items-center justify-center gap-7 sm:gap-8">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => {
                onToggleSound();
                showToast(soundEnabled ? 'Sound: Muted' : 'Sound: Active');
              }}
              title="Sound Effects"
              className={`relative flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full shadow-lg transition-transform active:scale-90 hover:scale-105 ${
                soundEnabled
                  ? 'bg-white text-[#1e1e20]'
                  : 'bg-slate-300 text-slate-600'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="h-6 w-6 fill-current" />
              ) : (
                <VolumeX className="h-6 w-6" />
              )}
              {!soundEnabled && (
                <span className="absolute h-0.5 w-7 -rotate-45 bg-rose-600 rounded-full" />
              )}
            </button>

            {/* Haptics / Vibration Toggle */}
            <button
              type="button"
              onClick={() => {
                onToggleHaptics();
                showToast(hapticsEnabled ? 'Haptics: Off' : 'Haptics: Active');
              }}
              title="Haptic Vibration"
              className={`relative flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full shadow-lg transition-transform active:scale-90 hover:scale-105 ${
                hapticsEnabled
                  ? 'bg-white text-[#1e1e20]'
                  : 'bg-slate-300 text-slate-600'
              }`}
            >
              <Smartphone className="h-6 w-6" />
              {!hapticsEnabled && (
                <span className="absolute h-0.5 w-7 -rotate-45 bg-rose-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Row 2: 3 Buttons (Crown/Best, Star/Lore, Award/Stats) */}
          <div className="flex items-center justify-center gap-4 sm:gap-5">
            {/* Crown: Mode High Scores */}
            <button
              type="button"
              onClick={() => {
                showToast(`Best: ${regularHighScore} | Challenge: ${challengeHighScore}`);
              }}
              title="High Scores"
              className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-white text-[#1e1e20] shadow-lg transition-transform active:scale-90 hover:scale-105"
            >
              <Crown className="h-6 w-6 fill-current" />
            </button>

            {/* Star: Story & Lore Modal */}
            <button
              type="button"
              onClick={onOpenStory}
              title="About Game & Story"
              className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-white text-[#1e1e20] shadow-lg transition-transform active:scale-90 hover:scale-105"
            >
              <Star className="h-6 w-6 fill-current" />
            </button>

            {/* Award: Celestial Achievements / Stats */}
            <button
              type="button"
              onClick={() => {
                showToast('Endless Orbit • Celestial Trajectory');
              }}
              title="Achievements"
              className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-white text-[#1e1e20] shadow-lg transition-transform active:scale-90 hover:scale-105"
            >
              <Award className="h-6 w-6 stroke-[2.2]" />
            </button>
          </div>

          {/* Row 3: 2 Buttons (Social Share & Replay Intro) */}
          <div className="flex items-center justify-center gap-7 sm:gap-8">
            {/* Social Share Button (WhatsApp & Social) */}
            <button
              type="button"
              onClick={() => {
                onShare();
                showToast('Sharing High Score...');
              }}
              title="Share with Friends"
              className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-white text-[#1e1e20] shadow-lg transition-transform active:scale-90 hover:scale-105"
            >
              <Share2 className="h-5 w-5 stroke-[2.4]" />
            </button>

            {/* Replay Studio Intro Splash */}
            <button
              type="button"
              onClick={onReplaySplash}
              title="Replay Shivoro Games Intro"
              className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-white text-[#1e1e20] shadow-lg transition-transform active:scale-90 hover:scale-105"
            >
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </button>
          </div>
        </div>

        {/* Bottom Credits Text (Chunky font, exactly as in Image 1) */}
        <div className="mt-1 text-center">
          <span className="font-game text-[9px] uppercase tracking-widest text-slate-400">
            Audio & Celestial Physics
          </span>
          <p className="font-game text-[9px] text-slate-300 tracking-wide mt-0.5">
            "Cosmic Orbit", produced by Shivoro Games
          </p>
        </div>
      </div>

      {/* Bottom Screen Bar: Exactly matching bottom circular buttons in Image 1 */}
      <div className="w-[90%] max-w-[340px] flex items-center justify-between px-2 pt-2 pb-1 shrink-0">
        {/* Left: Exit to Main Menu (if playing) or Close */}
        {isGameActive && onExitHome ? (
          <button
            type="button"
            onClick={onExitHome}
            title="Exit to Main Menu"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1e1e20] shadow-lg transition-transform active:scale-90"
          >
            <Home className="h-6 w-6" />
          </button>
        ) : (
          <div className="w-12 h-12" />
        )}

        {/* Right: Close Settings Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Settings"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1e1e20] shadow-lg transition-transform active:scale-90"
        >
          <X className="h-6 w-6 stroke-[2.6]" />
        </button>
      </div>
    </div>
  );
};
