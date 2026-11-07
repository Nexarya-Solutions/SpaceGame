import React, { useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameUI } from './components/GameUI';
import { GameApp } from './game/GameApp';

export const App: React.FC = () => {
  const gameAppRef = useRef<GameApp | null>(null);

  const handleGameAppReady = useCallback((app: GameApp) => {
    gameAppRef.current = app;
  }, []);

  const handleStart = useCallback(() => {
    gameAppRef.current?.handleInput();
  }, []);

  const handleRestart = useCallback(() => {
    gameAppRef.current?.restartGame();
  }, []);

  const handlePause = useCallback(() => {
    gameAppRef.current?.pause();
  }, []);

  const handleResume = useCallback(() => {
    gameAppRef.current?.resume();
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#070a14] select-none font-rajdhani">
      <GameCanvas onGameAppReady={handleGameAppReady} />
      <GameUI
        onRestart={handleRestart}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
      />
    </main>
  );
};

export default App;

