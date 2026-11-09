import React, { useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameUI } from './components/GameUI';
import { GameApp } from './game/GameApp';
import { GameMode } from './game/events/GameEvents';

export const App: React.FC = () => {
  const gameAppRef = useRef<GameApp | null>(null);

  const handleGameAppReady = useCallback((app: GameApp) => {
    gameAppRef.current = app;
  }, []);

  const handleStart = useCallback((options?: { mode?: GameMode }) => {
    gameAppRef.current?.startGame(options);
  }, []);

  const handleRestart = useCallback((options?: { mode?: GameMode }) => {
    gameAppRef.current?.restartGame(options);
  }, []);

  const handlePause = useCallback(() => {
    gameAppRef.current?.pause();
  }, []);

  const handleResume = useCallback(() => {
    gameAppRef.current?.resume();
  }, []);

  const handleSelectMode = useCallback((mode: GameMode) => {
    gameAppRef.current?.setGameMode(mode);
  }, []);

  const handleHome = useCallback(() => {
    gameAppRef.current?.returnToMenu();
  }, []);

  const handleEndGame = useCallback(() => {
    gameAppRef.current?.endGame();
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#070a14] select-none font-rajdhani">
      <GameCanvas onGameAppReady={handleGameAppReady} />
      <GameUI
        onRestart={handleRestart}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onSelectMode={handleSelectMode}
        onHome={handleHome}
        onEndGame={handleEndGame}
      />
    </main>
  );
};

export default App;

