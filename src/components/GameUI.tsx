import React, { useState, useEffect, useCallback } from 'react';
import {
  gameEvents,
  GAME_EVENTS,
  GameState,
  GameMode,
  ScoreData,
  GameOverData,
  MultiplierPowerupData,
  WarpSequenceData
} from '../game/events/GameEvents';
import { StorageManager } from '../game/services/StorageManager';
import { SoundManager } from '../game/audio/SoundManager';
import { StoryModal } from './StoryModal';
import { ProductionSplash } from './ProductionSplash';
import { MainMenu } from './MainMenu';
import { GameOverModal } from './GameOverModal';
import { SettingsModal } from './SettingsModal';
import { PauseModal } from './PauseModal';
import { ChallengeTimerHUD } from './ChallengeTimerHUD';
import { Share } from '@capacitor/share';
import {
  Trophy,
  Play,
  Sparkles,
  Zap,
  Compass,
  Settings,
  Pause
} from 'lucide-react';

const APP_VERSION = 'v1.0.0';

interface GameUIProps {
  onRestart: (options?: { mode?: GameMode }) => void;
  onStart: (options?: { mode?: GameMode }) => void;
  onPause: () => void;
  onResume: () => void;
  onSelectMode: (mode: GameMode) => void;
  onHome: () => void;
  onEndGame?: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  onRestart,
  onStart,
  onPause,
  onResume,
  onSelectMode,
  onHome,
  onEndGame
}) => {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentMode, setCurrentMode] = useState<GameMode>('REGULAR');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [altitude, setAltitude] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [regularHighScore, setRegularHighScore] = useState<number>(0);
  const [challengeHighScore, setChallengeHighScore] = useState<number>(0);
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);
  const [perfectMessage, setPerfectMessage] = useState<string | null>(null);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);

  // Pause Modal State
  const [isPauseModalOpen, setIsPauseModalOpen] = useState<boolean>(false);

  // Production Company Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

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

  const onPauseRef = React.useRef(onPause);
  onPauseRef.current = onPause;
  const currentModeRef = React.useRef(currentMode);
  currentModeRef.current = currentMode;

  const refreshHighScores = useCallback((modeOverride?: GameMode) => {
    const reg = StorageManager.getRegularHighScore();
    const ch = StorageManager.getChallengeHighScore();
    setRegularHighScore(reg);
    setChallengeHighScore(ch);
    const mode = modeOverride || currentModeRef.current;
    setHighScore(mode === 'DAILY_CHALLENGE' ? ch : reg);
  }, []);

  useEffect(() => {
    // Keep engine paused on initial load while splash plays
    onPauseRef.current();

    // Synchronize Storage
    const syncStorage = async () => {
      await StorageManager.init();
      refreshHighScores();
      setSoundEnabled(StorageManager.isSoundEnabled());
      setHapticsEnabled(StorageManager.isHapticsEnabled());
    };
    syncStorage();

    const offState = gameEvents.on<GameState>(GAME_EVENTS.STATE_CHANGE, (state) => {
      setGameState(state);
      if (state === 'MENU') {
        refreshHighScores();
      }
    });

    const offMode = gameEvents.on<GameMode>(GAME_EVENTS.MODE_CHANGE, (mode) => {
      setCurrentMode(mode);
      refreshHighScores(mode);
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
      setIsPauseModalOpen(false);
      setGameOverData(data);
      refreshHighScores();
    });

    const offMultiplier = gameEvents.on<MultiplierPowerupData>(GAME_EVENTS.MULTIPLIER_POWERUP_UPDATE, (data) => {
      setMultiplierPowerup(data);
    });

    const offWarp = gameEvents.on<WarpSequenceData>(GAME_EVENTS.WARP_SEQUENCE_UPDATE, (data) => {
      setWarpData(data);
    });

    return () => {
      offState();
      offMode();
      offScore();
      offPerfect();
      offGameOver();
      offMultiplier();
      offWarp();
    };
  }, [refreshHighScores]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    // After splash completes, check if user needs first-launch intro story
    if (!StorageManager.hasSeenIntroStory()) {
      setIsStoryOpen(true);
      setStoryMode('FIRST_LAUNCH');
      onPause();
    } else {
      onResume();
    }
  }, [onPause, onResume]);

  const openSettings = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStoryOpen || showSplash) return;
    if (isPauseModalOpen) setIsPauseModalOpen(false);
    setIsSettingsOpen(true);
    onPause();
  }, [isStoryOpen, showSplash, isPauseModalOpen, onPause]);

  const closeSettings = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSettingsOpen(false);
    onResume();
  }, [onResume]);

  const handlePauseClick = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isStoryOpen || showSplash || gameState !== 'PLAYING') return;
    setIsPauseModalOpen(true);
    onPause();
  }, [isStoryOpen, showSplash, gameState, onPause]);

  const handleResumeFromPause = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPauseModalOpen(false);
    onResume();
  }, [onResume]);

  const handleEndGameClick = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPauseModalOpen(false);
    if (onEndGame) {
      onEndGame();
    } else {
      onHome();
    }
    refreshHighScores();
  }, [onEndGame, onHome, refreshHighScores]);

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

  const handleOpenStoryFromSettings = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSettingsOpen(false);
    setStoryMode('SETTINGS');
    setIsStoryOpen(true);
  }, []);

  const handleBackToSettings = useCallback(() => {
    setIsStoryOpen(false);
    setIsSettingsOpen(true);
  }, []);

  const toggleSound = useCallback(async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    await StorageManager.setSoundEnabled(nextVal);
    SoundManager.setMuted(!nextVal);
  }, [soundEnabled]);

  const toggleHaptics = useCallback(async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextVal = !hapticsEnabled;
    setHapticsEnabled(nextVal);
    await StorageManager.setHapticsEnabled(nextVal);
  }, [hapticsEnabled]);

  const handleShareFromSettings = async () => {
    const text = `🌌 I scored ${highScore} in Endless Orbit! Can you beat my orbit?\n\nDeveloped by Shivoro Games 🚀\n#EndlessOrbit #ShivoroGames #MobileGaming`;
    try {
      const canShare = await Share.canShare().catch(() => ({ value: false }));
      if (canShare?.value) {
        await Share.share({
          title: 'Endless Orbit High Score',
          text,
          dialogTitle: 'Share with Friends'
        });
      } else {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    } catch {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  const handleRestartClick = () => {
    setIsPauseModalOpen(false);
    setGameOverData(null);
    onRestart({ mode: currentMode });
  };

  const handleHomeClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPauseModalOpen(false);
    setGameOverData(null);
    setIsSettingsOpen(false);
    onHome();
  };

  const handleStartClick = () => {
    if (isSettingsOpen || isStoryOpen || showSplash) return;
    onStart({ mode: currentMode });
  };

  const handleSelectMode = (mode: GameMode) => {
    setCurrentMode(mode);
    refreshHighScores(mode);
    onSelectMode(mode);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 select-none">
      {/* Top Header / HUD */}
      <header className="flex w-full items-start justify-between">
        {/* Score & Multiplier */}
        {gameState === 'PLAYING' && (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2">
              <span className="font-game text-4xl sm:text-5xl font-black tracking-wide text-white leading-none">
                {score.toLocaleString()}
              </span>
              {multiplier > 1 && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 font-game text-xs font-bold text-amber-200 border border-amber-300/30">
                  {multiplier}x
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs tracking-wider text-slate-300 font-game">
              <span className="flex items-center gap-1 font-bold">
                <Trophy className="h-3.5 w-3.5 text-amber-300" /> {highScore}
              </span>
              <span className="flex items-center gap-1 font-bold">
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

        {/* Daily Challenge Timer HUD (Centered at top when playing) */}
        {gameState === 'PLAYING' && currentMode === 'DAILY_CHALLENGE' && (
          <div className="pointer-events-auto">
            <ChallengeTimerHUD />
          </div>
        )}

        {/* If in Menu, show high score badge */}
        {gameState === 'MENU' && (
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/70 px-4 py-1.5 backdrop-blur-md shadow-lg">
            <Trophy className="h-4 w-4 text-amber-300" />
            <span className="font-game text-xs tracking-wider text-slate-300 uppercase">
              {currentMode === 'DAILY_CHALLENGE' ? 'CHALLENGE BEST' : 'BEST'}:{' '}
              <strong className="text-white text-sm">{highScore}</strong>
            </span>
          </div>
        )}

        {/* Action Controls (Pinned Top-Right: Pause & Settings) */}
        {!isStoryOpen && !showSplash && (
          <div className="pointer-events-auto flex items-center gap-2.5">
            {/* Pause Button: only visible during active gameplay */}
            {gameState === 'PLAYING' && (
              <button
                onClick={handlePauseClick}
                aria-label="Pause Game"
                title="Pause Game"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1e1e20] shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-transform active:scale-90 hover:scale-105"
              >
                <Pause className="h-5 w-5 fill-[#1e1e20]" />
              </button>
            )}
            <button
              onClick={openSettings}
              aria-label="Settings"
              title="Settings"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1e1e20] shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-transform active:scale-90 hover:scale-105"
            >
              <Settings className="h-5 w-5 stroke-[2.4]" />
            </button>
          </div>
        )}
      </header>

      {/* Center Floating Feedback & Active Power-Up Timers */}
      <div className="flex flex-col items-center justify-center gap-2.5">
        {/* 2X Multiplier Cooldown Bar */}
        {gameState === 'PLAYING' && multiplierPowerup.active && (
          <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-amber-400/40 bg-slate-950/85 px-4 py-2 shadow-[0_0_25px_rgba(223,177,91,0.25)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 font-game tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span>2X SCORE CORE</span>
              <span className="font-game text-xs text-amber-100 bg-amber-400/20 px-1.5 py-0.5 rounded border border-amber-400/30">
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
            <div className="flex items-center gap-2 text-xs font-black tracking-wider text-cyan-200 font-game">
              <Zap className="h-3.5 w-3.5 text-cyan-300 fill-cyan-300" />
              <span>CHAIN WARP CONDUIT</span>
              <span className="font-game text-xs text-white bg-cyan-500/30 px-1.5 py-0.5 rounded border border-cyan-400/40">
                HOP {warpData.hop}/5
              </span>
            </div>
            {/* 5-node transit indicator */}
            <div className="flex items-center gap-2 pt-0.5">
              {[1, 2, 3, 4, 5].map((step) => (
                <span
                  key={step}
                  className={`h-2 w-2 rounded-full transition-all duration-200 ${
                    step <= warpData.hop
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
          <div className="animate-bounce rounded-full border border-white/20 bg-slate-900/80 px-4 py-1.5 font-game text-xs font-bold tracking-wider text-amber-200 shadow-[0_0_25px_rgba(255,255,255,0.15)] backdrop-blur-md">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              {perfectMessage}
            </span>
          </div>
        )}
      </div>

      {/* Main Menu Overlay (Centered on Mobile & Desktop) */}
      {gameState === 'MENU' && !isSettingsOpen && !isStoryOpen && !showSplash && (
        <MainMenu
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
          regularHighScore={regularHighScore}
          challengeHighScore={challengeHighScore}
          onStart={handleStartClick}
        />
      )}

      {/* Pause Modal Overlay */}
      <PauseModal
        isOpen={isPauseModalOpen && !isSettingsOpen && !isStoryOpen && !showSplash}
        score={score}
        highScore={highScore}
        altitude={altitude}
        combo={combo}
        currentMode={currentMode}
        onResume={handleResumeFromPause}
        onEndGame={handleEndGameClick}
      />

      {/* Settings Modal (Designed exactly to match Image 1 with no scrollbar) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        hapticsEnabled={hapticsEnabled}
        onToggleHaptics={toggleHaptics}
        onOpenStory={handleOpenStoryFromSettings}
        onReplaySplash={() => {
          setIsSettingsOpen(false);
          setShowSplash(true);
          onPause();
        }}
        onShare={handleShareFromSettings}
        onClose={closeSettings}
        onExitHome={handleHomeClick}
        isGameActive={gameState === 'PLAYING'}
        regularHighScore={regularHighScore}
        challengeHighScore={challengeHighScore}
      />

      {/* Game Over Modal (Designed exactly to match Image 2 with no scrollbar) */}
      {gameState === 'GAMEOVER' && gameOverData && !isSettingsOpen && !isStoryOpen && !showSplash && (
        <GameOverModal
          data={gameOverData}
          onRestart={handleRestartClick}
          onHome={handleHomeClick}
          onOpenSettings={() => {
            setIsSettingsOpen(true);
            onPause();
          }}
        />
      )}

      {/* Story Onboarding & Lore Modal */}
      <StoryModal
        isOpen={isStoryOpen}
        mode={storyMode}
        onBeginJourney={handleBeginJourney}
        onSkip={handleSkipStory}
        onBackToSettings={handleBackToSettings}
      />

      {/* Production Company Intro Splash Screen */}
      {showSplash && (
        <ProductionSplash onComplete={handleSplashComplete} />
      )}
    </div>
  );
};
