import React, { useEffect, useRef } from 'react';
import { GameApp } from '../game/GameApp';

interface GameCanvasProps {
  onGameAppReady?: (app: GameApp) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onGameAppReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameAppRef = useRef<GameApp | null>(null);
  const onReadyRef = useRef(onGameAppReady);
  onReadyRef.current = onGameAppReady;

  useEffect(() => {
    if (!containerRef.current) return;

    let isCancelled = false;
    const gameApp = new GameApp(containerRef.current);
    gameAppRef.current = gameApp;

    gameApp.init().then(() => {
      if (isCancelled) {
        gameApp.destroy();
        return;
      }
      onReadyRef.current?.(gameApp);
    }).catch((err) => {
      console.warn('GameApp init error:', err);
    });

    const handleResize = () => {
      if (containerRef.current && gameAppRef.current) {
        gameAppRef.current.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(containerRef.current);

    // Keyboard controls (Space / ArrowUp / Enter)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
        e.preventDefault();
        if (gameAppRef.current?.isPaused) return;
        gameAppRef.current?.handleInput();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isCancelled = true;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      resizeObserver.disconnect();
      try {
        gameApp.destroy();
      } catch (err) {
        console.warn('Error during game destroy:', err);
      }
      if (gameAppRef.current === gameApp) {
        gameAppRef.current = null;
      }
    };
  }, []);

  // Pointer / Touch listener on container
  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameAppRef.current?.isPaused) return;
    gameAppRef.current?.handleInput();
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className="absolute inset-0 h-full w-full overflow-hidden touch-none cursor-pointer bg-[#070a14]"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    />
  );
};

