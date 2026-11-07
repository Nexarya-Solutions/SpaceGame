import { Preferences } from '@capacitor/preferences';

const KEYS = {
  HIGH_SCORE: 'endless_orbit_high_score',
  SOUND_ENABLED: 'endless_orbit_sound',
  HAPTICS_ENABLED: 'endless_orbit_haptics',
  TOTAL_GAMES: 'endless_orbit_total_games',
  HAS_SEEN_INTRO_STORY: 'hasSeenIntroStory'
};

export class StorageManager {
  private static highScoreCache: number = 0;
  private static soundCache: boolean = true;
  private static hapticsCache: boolean = true;
  private static hasSeenIntroStoryCache: boolean = false;
  private static initialized: boolean = false;

  public static async init(): Promise<void> {
    if (this.initialized) return;
    try {
      const { value: hs } = await Preferences.get({ key: KEYS.HIGH_SCORE });
      this.highScoreCache = hs ? parseInt(hs, 10) || 0 : 0;

      const { value: snd } = await Preferences.get({ key: KEYS.SOUND_ENABLED });
      this.soundCache = snd !== null ? snd === 'true' : true;

      const { value: hpt } = await Preferences.get({ key: KEYS.HAPTICS_ENABLED });
      this.hapticsCache = hpt !== null ? hpt === 'true' : true;

      const { value: intro } = await Preferences.get({ key: KEYS.HAS_SEEN_INTRO_STORY });
      if (intro !== null) {
        this.hasSeenIntroStoryCache = intro === 'true';
      } else {
        const localIntro = localStorage.getItem(KEYS.HAS_SEEN_INTRO_STORY);
        this.hasSeenIntroStoryCache = localIntro === 'true';
      }
    } catch {
      // Fallback to localStorage
      try {
        const hs = localStorage.getItem(KEYS.HIGH_SCORE);
        this.highScoreCache = hs ? parseInt(hs, 10) || 0 : 0;
        const snd = localStorage.getItem(KEYS.SOUND_ENABLED);
        this.soundCache = snd !== null ? snd === 'true' : true;
        const hpt = localStorage.getItem(KEYS.HAPTICS_ENABLED);
        this.hapticsCache = hpt !== null ? hpt === 'true' : true;
        const intro = localStorage.getItem(KEYS.HAS_SEEN_INTRO_STORY);
        this.hasSeenIntroStoryCache = intro === 'true';
      } catch {
        // Storage unavailable, defaults stand
      }
    }
    this.initialized = true;
  }

  public static hasSeenIntroStory(): boolean {
    return this.hasSeenIntroStoryCache;
  }

  public static async setHasSeenIntroStory(seen: boolean): Promise<void> {
    this.hasSeenIntroStoryCache = seen;
    try {
      await Preferences.set({ key: KEYS.HAS_SEEN_INTRO_STORY, value: String(seen) });
    } catch {
      // ignore
    }
    try {
      localStorage.setItem(KEYS.HAS_SEEN_INTRO_STORY, String(seen));
    } catch {
      // ignore
    }
  }

  public static getHighScore(): number {
    return this.highScoreCache;
  }

  public static async setHighScore(score: number): Promise<boolean> {
    if (score > this.highScoreCache) {
      this.highScoreCache = score;
      try {
        await Preferences.set({ key: KEYS.HIGH_SCORE, value: score.toString() });
      } catch {
        try {
          localStorage.setItem(KEYS.HIGH_SCORE, score.toString());
        } catch {
          // ignore
        }
      }
      return true; // New record
    }
    return false;
  }

  public static isSoundEnabled(): boolean {
    return this.soundCache;
  }

  public static async setSoundEnabled(enabled: boolean): Promise<void> {
    this.soundCache = enabled;
    try {
      await Preferences.set({ key: KEYS.SOUND_ENABLED, value: String(enabled) });
    } catch {
      try {
        localStorage.setItem(KEYS.SOUND_ENABLED, String(enabled));
      } catch {
        // ignore
      }
    }
  }

  public static isHapticsEnabled(): boolean {
    return this.hapticsCache;
  }

  public static async setHapticsEnabled(enabled: boolean): Promise<void> {
    this.hapticsCache = enabled;
    try {
      await Preferences.set({ key: KEYS.HAPTICS_ENABLED, value: String(enabled) });
    } catch {
      try {
        localStorage.setItem(KEYS.HAPTICS_ENABLED, String(enabled));
      } catch {
        // ignore
      }
    }
  }
}

