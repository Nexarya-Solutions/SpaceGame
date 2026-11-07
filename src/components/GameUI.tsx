import React, { useState, useEffect, useCallback } from 'react';
import {
  gameEvents,
  GAME_EVENTS,
  GameState,
  ScoreData,
  GameOverData,
  MultiplierPowerupData,
  WarpSequenceData
} from '../game/events/GameEvents';
import { StorageManager } from '../game/services/StorageManager';
import { SoundManager } from '../game/audio/SoundManager';
import { StoryModal } from './StoryModal';
import {
  Volume2,
  VolumeX,
  Smartphone,
  Trophy,
  RotateCcw,
  Play,
  Sparkles,
  Zap,
  AlertTriangle,
  Compass,
  Settings,
  X,
  Check,
  BookOpen,
  ChevronRight
} from 'lucide-react';

const APP_VERSION = 'v1.0.0';

interface GameUIProps {
  onRestart: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  onRestart,
  onStart,
  onPause,
  onResume
}) => {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [altitude, setAltitude] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);
  const [perfectMessage, setPerfectMessage] = useState<string | null>(null);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);

  // Story Onboarding & Lore Modal State
  const [isStoryOpen, setIsStoryOpen] = useState<boolean>(false);
  const [storyMode, setStoryMode] = useState<'FIRST_LAUNCH' | 'SETTINGS'>('FIRST_LAUNCH');

  // Power-Ups & Warp state
  const [multiplierPowerup, setMultiplierPowerup] = useState<{ active: boolean; remaining: number; total: number }>({
    active: false,
    remaining: 0,
    total: 10
  });
  const [warpData, setWarpData] = useState<{ active: boolean; hop: number; totalHops: number }>({
    active: false,
    hop: 0,
    totalHops: 5
  });

  useEffect(() => {
    // Synchronize Storage and check for first-launch intro story
    const syncStorageAndCheckFirstLaunch = async () => {
      await StorageManager.init();
      setHighScore(StorageManager.getHighScore());
      setSoundEnabled(StorageManager.isSoundEnabled());
      setHapticsEnabled(StorageManager.isHapticsEnabled());

      // If user has not seen intro story, open story onboarding modal immediately
      if (!StorageManager.hasSeenIntroStory()) {
        setIsStoryOpen(true);
        setStoryMode('FIRST_LAUNCH');
        onPause();
      }
    };
    syncStorageAndCheckFirstLaunch();

    const offState = gameEvents.on<GameState>(GAME_EVENTS.STATE_CHANGE, (state) => {
      setGameState(state);
    });

    const offScore = gameEvents.on<ScoreData>(GAME_EVENTS.SCORE_UPDATE, (data) => {
      setScore(data.score);
      setCombo(data.combo);
      setMultiplier(data.multiplier);
      setAltitude(data.altitude);
    });

    const offPerfect = gameEvents.on(GAME_EVENTS.PERFECT_CAPTURE, () => {
      setPerfectMessage('PERFECT ORBIT! +15');
      const timer = setTimeout(() => {
        setPerfectMessage(null);
      }, 1100);
      return () => clearTimeout(timer);
    });

    const offGameOver = gameEvents.on<GameOverData>(GAME_EVENTS.GAME_OVER, (data) => {
      setGameOverData(data);
      setHighScore(data.highScore);
    });

    const offMultiplier = gameEvents.on<MultiplierPowerupData>(GAME_EVENTS.MULTIPLIER_POWERUP_UPDATE, (data) => {
      setMultiplierPowerup(data);
    });

    const offWarp = gameEvents.on<WarpSequenceData>(GAME_EVENTS.WARP_SEQUENCE_UPDATE, (data) => {
      setWarpData(data);
    });

    return () => {
      offState();
      offScore();
      offPerfect();
      offGameOver();
      offMultiplier();
      offWarp();
    };
  }, [onPause]);

  const openSettings = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStoryOpen) return;
    setIsSettingsOpen(true);
    onPause();
  }, [isStoryOpen, onPause]);

  const closeSettings = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSettingsOpen(false);
    onResume();
  }, [onResume]);

  // Story Navigation Handlers
  const handleBeginJourney = useCallback(async () => {
    setIsStoryOpen(false);
    await StorageManager.setHasSeenIntroStory(true);
    onResume();
    onStart(); // Launch directly into the cosmic journey
  }, [onResume, onStart]);

  const handleSkipStory = useCallback(async () => {
    setIsStoryOpen(false);
    await StorageManager.setHasSeenIntroStory(true);
    onResume(); // Resume game loop in menu state ready for user tap
  }, [onResume]);

  const handleOpenStoryFromSettings = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSettingsOpen(false);
    setStoryMode('SETTINGS');
    setIsStoryOpen(true);
  }, []);

  const handleBackToSettings = useCallback(() => {
    setIsStoryOpen(false);
    setIsSettingsOpen(true);
  }, []);

  const toggleSound = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    await StorageManager.setSoundEnabled(nextVal);
    SoundManager.setMuted(!nextVal);
  }, [soundEnabled]);

  const toggleHaptics = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !hapticsEnabled;
    setHapticsEnabled(nextVal);
    await StorageManager.setHapticsEnabled(nextVal);
  }, [hapticsEnabled]);

  const handleRestartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGameOverData(null);
    onRestart();
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSettingsOpen || isStoryOpen) return;
    onStart();
  };

  const getReasonBadge = (reason: GameOverData['reason']) => {
    switch (reason) {
      case 'HAZARD_COLLISION':
        return {
          title: 'MOLTEN STAR COLLISION',
          desc: 'Gravitational capture by a superheated star pulverized the celestial comet.',
          color: 'text-rose-400 border-rose-500/30 bg-rose-950/40'
        };
      case 'DEBRIS_COLLISION':
        return {
          title: 'CELESTIAL IMPACT',
          desc: 'Collision with orbiting crystalline debris shattered the comet trajectory.',
          color: 'text-amber-300 border-amber-500/30 bg-amber-950/40'
        };
      case 'LOST_IN_SPACE':
      default:
        return {
          title: 'LOST IN ASTRAL VOID',
          desc: 'Launched into empty space without reaching the gravitational orbit of an anchor planet.',
          color: 'text-sky-300 border-sky-500/30 bg-sky-950/40'
        };
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 select-none">
      {/* Top Header / HUD */}
      <header className="flex w-full items-start justify-between">
        {/* Score & Multiplier */}
        {gameState === 'PLAYING' && (
          <div className="flex flex-col gap-1 drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">
            <div className="flex items-baseline gap-2">
              <span className="font-orbitron text-4xl font-black tracking-wider text-white">
                {score.toLocaleString()}
              </span>
              {multiplier > 1 && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 font-orbitron text-xs font-bold text-amber-200 border border-amber-300/30">
                  {multiplier}x
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs tracking-wider text-slate-300 font-rajdhani">
              <span className="flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-amber-300" /> {highScore}
              </span>
              <span className="flex items-center gap-1">
                <Compass className="h-3.5 w-3.5 text-sky-300" /> {altitude}km
              </span>
              {combo > 1 && (
                <span className="flex items-center gap-1 text-emerald-300 font-bold">
                  <Zap className="h-3.5 w-3.5 text-emerald-400" /> {combo} COMBO
                </span>
              )}
            </div>
          </div>
        )}
        {/* If in Menu, show high score */}
        {gameState === 'MENU' && (
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3.5 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.03)]">
            <Trophy className="h-3.5 w-3.5 text-amber-300" />
            <span className="font-orbitron text-xs tracking-wider text-slate-300">
              BEST: <strong className="text-white">{highScore}</strong>
            </span>
          </div>
        )}

        {/* Settings Icon Button (Pinned Top-Right) */}
        {!isStoryOpen && (
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={openSettings}
              aria-label="Settings"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-900/70 text-slate-200 backdrop-blur-md transition-all active:scale-95 hover:border-white/40 hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.06)]"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      {/* Center Floating Feedback & Active Power-Up Timers */}
      <div className="flex flex-col items-center justify-center gap-2.5">
        {/* 2X Multiplier Cooldown Bar */}
        {gameState === 'PLAYING' && multiplierPowerup.active && (
          <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-amber-400/40 bg-slate-950/85 px-4 py-2 shadow-[0_0_25px_rgba(223,177,91,0.25)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 font-orbitron">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span>2X SCORE CORE</span>
              <span className="font-mono text-[11px] text-amber-100 bg-amber-400/20 px-1.5 py-0.5 rounded border border-amber-400/30">
                {multiplierPowerup.remaining.toFixed(1)}s
              </span>
            </div>
            {/* Linear cooldown bar */}
            <div className="h-1.5 w-36 overflow-hidden rounded-full bg-slate-800 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-100 transition-all duration-75 ease-linear"
                style={{ width: `${Math.min(100, Math.max(0, (multiplierPowerup.remaining / multiplierPowerup.total) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Chain Warp Conduit Banner */}
        {gameState === 'PLAYING' && warpData.active && (
          <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-cyan-300/50 bg-slate-950/90 px-4 py-2 shadow-[0_0_30px_rgba(137,194,217,0.35)] backdrop-blur-md animate-pulse">
            <div className="flex items-center gap-2 text-xs font-black tracking-widest text-cyan-200 font-orbitron">
              <Zap className="h-3.5 w-3.5 text-cyan-300 fill-cyan-300" />
              <span>CHAIN WARP CONDUIT</span>
              <span className="font-mono text-[10px] text-white bg-cyan-500/30 px-1.5 py-0.5 rounded border border-cyan-400/40">
                HOP {warpData.hop}/5
              </span>
            </div>
            {/* 5-node transit indicator */}
            <div className="flex items-center gap-2 pt-0.5">
              {[1, 2, 3, 4, 5].map((step) => (
                <span
                  key={step}
                  className={`h-2 w-2 rounded-full transition-all duration-200 ${step <= warpData.hop
                      ? 'bg-cyan-300 shadow-[0_0_8px_#89c2d9] scale-125'
                      : 'bg-slate-700'
                    }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Perfect Orbit Floating Badge */}
        {perfectMessage && (
          <div className="animate-bounce rounded-full border border-white/20 bg-slate-900/80 px-4 py-1.5 font-orbitron text-xs font-bold tracking-widest text-amber-200 shadow-[0_0_25px_rgba(255,255,255,0.15)] backdrop-blur-md">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              {perfectMessage}
            </span>
          </div>
        )}
      </div>

      {/* Main Menu Overlay (Centered on Mobile & Desktop) */}
      {gameState === 'MENU' && !isSettingsOpen && !isStoryOpen && (
        <div className="pointer-events-auto my-auto flex w-full flex-col items-center justify-center px-4 py-4 text-center">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-slate-950/80 p-6 sm:p-7 shadow-[0_0_50px_rgba(255,255,255,0.06)] backdrop-blur-xl">
            {/* Comet Symbol Badge: Polished Single Red Dot with Specular Sheen (No Blinking) */}
            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-slate-900/80 to-slate-950 p-2 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
              {/* Outer soft ambient glow */}
              <div className="h-10 w-10 rounded-full bg-red-600/20 flex items-center justify-center">
                {/* Clean, solid single red dot */}
                <div className="relative h-6 w-6 rounded-full bg-[#ee2244] shadow-[0_0_12px_rgba(238,34,68,0.5)] border border-[#990022]">
                  {/* Glossy specular highlight */}
                  <span className="absolute top-1 left-1 h-2 w-2 rounded-full bg-white/90" />
                </div>
              </div>
            </div>

            {/* Game Title */}
            <h1 className="font-orbitron text-3xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">
              ENDLESS ORBIT
            </h1>
            <p className="mt-1 font-rajdhani text-xs sm:text-sm font-bold tracking-widest text-slate-400 uppercase">
              CELESTIAL TRAJECTORY ARCADE
            </p>

            {/* Tap to Launch Button */}
            <div className="my-5">
              <button
                onClick={handleStartClick}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/25 bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80 py-3.5 px-6 font-orbitron text-sm font-bold tracking-widest text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-white/40 active:scale-95"
              >
                <Play className="h-4 w-4 fill-white text-white transition-transform group-hover:scale-110" />
                <span>TAP TO LAUNCH</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              </button>
            </div>

            {/* Clear Visual Instructions */}
            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs font-rajdhani text-left">
              <div className="flex items-start gap-2.5 text-slate-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-white text-[11px] font-bold">1</span>
                <span><strong>Tap screen:</strong> Releases orbit and launches along velocity tangent</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-white text-[11px] font-bold">2</span>
                <span><strong>Gravity capture:</strong> Snaps into next orbit matching entry angle</span>
              </div>
              <div className="flex items-start gap-2.5 text-amber-200">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold">★</span>
                <span><strong>Power-ups:</strong> Collect 2x Golden Cores & Prismatic Chain Warps</span>
              </div>
              <div className="flex items-start gap-2.5 text-rose-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-[11px] font-bold">!</span>
                <span><strong>Celestial hazards:</strong> Avoid molten stars and orbiting debris</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal Overlay */}
      {isSettingsOpen && (
        <div
          onClick={() => closeSettings()}
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-black p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/15">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-orbitron text-lg font-bold tracking-wider text-white">
                  SETTINGS
                </h3>
              </div>
              <button
                onClick={() => closeSettings()}
                aria-label="Close Settings"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Settings Toggles List */}
            <div className="py-4 space-y-3 font-rajdhani">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                    {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-300" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Sound Effects</p>
                    <p className="text-xs text-slate-400">Launch audio & capture chimes</p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Vibration Toggle */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Smartphone className={`h-4 w-4 ${hapticsEnabled ? 'text-cyan-300' : 'text-slate-500'}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Haptic Vibration</p>
                    <p className="text-xs text-slate-400">Tactile impact on capture & crash</p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <button
                  type="button"
                  onClick={toggleHaptics}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${hapticsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hapticsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* About Game / Story Lore Row */}
              <button
                type="button"
                onClick={handleOpenStoryFromSettings}
                className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5 text-left transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20 text-rose-300 border border-red-500/30">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">About Game</p>
                    <p className="text-xs text-slate-400">Lore & Celestial Odyssey</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              </button>

              {/* Game Version Display */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs">
                <span className="text-slate-400">Game Build Version</span>
                <span className="font-orbitron font-semibold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                  {APP_VERSION}
                </span>
              </div>
            </div>

            {/* Resume / Close Button */}
            <div className="pt-2">
              <button
                onClick={() => closeSettings()}
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-gradient-to-r from-slate-800 to-slate-700 py-3 font-orbitron text-xs font-bold tracking-widest text-white shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all hover:border-white/40 active:scale-95"
              >
                {gameState === 'PLAYING' ? (
                  <>
                    <Play className="h-3.5 w-3.5 fill-white text-white" />
                    <span>RESUME GAME</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 text-white" />
                    <span>CLOSE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal Overlay */}
      {gameState === 'GAMEOVER' && gameOverData && !isSettingsOpen && !isStoryOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            {/* Header / Reason */}
            <div className="text-center">
              {(() => {
                const info = getReasonBadge(gameOverData.reason);
                return (
                  <div className={`mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-orbitron text-[10px] font-bold tracking-wider ${info.color}`}>
                    <AlertTriangle className="h-3 w-3" />
                    {info.title}
                  </div>
                );
              })()}

              <h2 className="font-orbitron text-2xl font-black tracking-wider text-white">
                ORBIT TERMINATED
              </h2>

              {/* Score Display */}
              <div className="my-5 flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-rajdhani">
                  FINAL SCORE
                </span>
                <span className="font-orbitron text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.3)]">
                  {gameOverData.score.toLocaleString()}
                </span>
                {gameOverData.score >= gameOverData.highScore && gameOverData.score > 0 && (
                  <div className="mt-2 flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 text-xs font-bold text-amber-300 font-orbitron">
                    <Sparkles className="h-3 w-3" /> NEW HIGH SCORE!
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-rajdhani">
                    BEST SCORE
                  </span>
                  <p className="font-orbitron text-lg font-bold text-white">
                    {gameOverData.highScore.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-rajdhani">
                    MAX COMBO
                  </span>
                  <p className="font-orbitron text-lg font-bold text-amber-200">
                    {gameOverData.maxCombo}x
                  </p>
                </div>
              </div>

              {/* Reason Explanation */}
              <p className="text-xs text-slate-400 font-rajdhani mb-6 leading-relaxed">
                {getReasonBadge(gameOverData.reason).desc}
              </p>

              {/* Restart Button */}
              <button
                onClick={handleRestartClick}
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-gradient-to-r from-slate-800 to-slate-700 py-3.5 font-orbitron text-sm font-bold tracking-widest text-white shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all hover:border-white/40 active:scale-95"
              >
                <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-90 duration-300" />
                <span>LAUNCH AGAIN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Onboarding & Lore Modal */}
      <StoryModal
        isOpen={isStoryOpen}
        mode={storyMode}
        onBeginJourney={handleBeginJourney}
        onSkip={handleSkipStory}
        onBackToSettings={handleBackToSettings}
      />

      {/* Bottom Hint during active gameplay */}
      {gameState === 'PLAYING' && !isSettingsOpen && !isStoryOpen && (
        <footer className="flex w-full justify-center pb-2">
          <div className="rounded-full border border-white/10 bg-black/40 px-4 py-1 backdrop-blur-md">
            <span className="font-rajdhani text-xs tracking-wider text-slate-400">
              TAP SCREEN OR PRESS SPACE TO LAUNCH
            </span>
          </div>
        </footer>
      )}
    </div>
  );
};
