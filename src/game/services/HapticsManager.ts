import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StorageManager } from './StorageManager';

export class HapticsManager {
  public static async captureImpact(): Promise<void> {
    if (!StorageManager.isHapticsEnabled()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(20);
      }
    }
  }

  public static async perfectImpact(): Promise<void> {
    if (!StorageManager.isHapticsEnabled()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([25, 30, 25]);
      }
    }
  }

  public static async launchImpact(): Promise<void> {
    if (!StorageManager.isHapticsEnabled()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(12);
      }
    }
  }

  public static async pickupImpact(): Promise<void> {
    if (!StorageManager.isHapticsEnabled()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(28);
      }
    }
  }

  public static async warpHopImpact(hop: number = 1): Promise<void> {
    if (!StorageManager.isHapticsEnabled()) return;
    try {
      await Haptics.impact({ style: hop >= 5 ? ImpactStyle.Heavy : ImpactStyle.Medium });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(hop >= 5 ? 40 : 22);
      }
    }
  }

  public static async crashImpact(): Promise<void> {
    if (!StorageManager.isHapticsEnabled()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      // Short delay then vibrate
      setTimeout(async () => {
        if (!StorageManager.isHapticsEnabled()) return;
        try {
          await Haptics.vibrate({ duration: 350 });
        } catch {
          // ignore
        }
      }, 50);
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([80, 50, 150]);
      }
    }
  }
}

