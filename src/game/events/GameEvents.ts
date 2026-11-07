export type GameState = 'MENU' | 'PLAYING' | 'GAMEOVER';

export interface ScoreData {
  score: number;
  combo: number;
  multiplier: number;
  altitude: number;
  isPerfect: boolean;
}

export interface GameOverData {
  score: number;
  highScore: number;
  orbitsCount: number;
  maxCombo: number;
  reason: 'LOST_IN_SPACE' | 'HAZARD_COLLISION' | 'DEBRIS_COLLISION';
}

export interface MultiplierPowerupData {
  active: boolean;
  remaining: number;
  total: number;
}

export interface WarpSequenceData {
  active: boolean;
  hop: number;
  totalHops: number;
}

export type EventCallback<T = any> = (data: T) => void;

class EventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off<T>(event: string, callback: EventCallback<T>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit<T>(event: string, data?: T): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in event handler for ${event}:`, err);
        }
      });
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

export const gameEvents = new EventEmitter();

// Event names as constants
export const GAME_EVENTS = {
  STATE_CHANGE: 'STATE_CHANGE',
  SCORE_UPDATE: 'SCORE_UPDATE',
  COMBO_BONUS: 'COMBO_BONUS',
  GAME_OVER: 'GAME_OVER',
  PERFECT_CAPTURE: 'PERFECT_CAPTURE',
  ORBIT_CAPTURE: 'ORBIT_CAPTURE',
  LAUNCH: 'LAUNCH',
  SOUND_TOGGLE: 'SOUND_TOGGLE',
  HAPTIC_TOGGLE: 'HAPTIC_TOGGLE',
  GAME_PAUSED: 'GAME_PAUSED',
  GAME_RESUMED: 'GAME_RESUMED',
  MULTIPLIER_POWERUP_UPDATE: 'MULTIPLIER_POWERUP_UPDATE',
  WARP_SEQUENCE_UPDATE: 'WARP_SEQUENCE_UPDATE'
} as const;

