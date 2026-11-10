import { StorageManager } from '../services/StorageManager';

export class SoundManager {
  private static ctx: AudioContext | null = null;
  private static isInitialized: boolean = false;
  private static ambientGain: GainNode | null = null;
  private static masterGain: GainNode | null = null;
  private static pentatonicFrequencies: number[] = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
    783.99, // G5
    880.00, // A5
    1046.50 // C6
  ];

  public static init(): void {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(StorageManager.isSoundEnabled() ? 0.8 : 0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  public static resume(): void {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public static pauseAudio(): void {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public static resumeAudio(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public static setMuted(muted: boolean): void {
    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : 0.8;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.05);
    }
  }

  public static playClick(): void {
    if (!StorageManager.isSoundEnabled() || !this.ctx || !this.masterGain) return;
    this.resume();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.05);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Audio fallback
    }
  }

  public static playLaunch(): void {
    if (!StorageManager.isSoundEnabled() || !this.ctx || !this.masterGain) return;
    this.resume();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio fallback
    }
  }

  public static playCapture(combo: number = 0): void {
    if (!StorageManager.isSoundEnabled() || !this.ctx || !this.masterGain) return;
    this.resume();

    try {
      const now = this.ctx.currentTime;
      const freqIndex = Math.min(combo, this.pentatonicFrequencies.length - 1);
      const baseFreq = this.pentatonicFrequencies[freqIndex];

      // Primary melodic chime
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(baseFreq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 2.01, now); // subtle shimmer harmonic

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3500, now);
      filter.frequency.exponentialRampToValueAtTime(1000, now + 0.28);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.33);
      osc2.stop(now + 0.33);
    } catch {
      // Audio fallback
    }
  }

  public static playPerfect(): void {
    if (!StorageManager.isSoundEnabled() || !this.ctx || !this.masterGain) return;
    this.resume();

    try {
      const now = this.ctx.currentTime;
      [880, 1320, 1760].forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        const startTime = now + idx * 0.04;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch {
      // Audio fallback
    }
  }

  public static playCrash(): void {
    if (!StorageManager.isSoundEnabled() || !this.ctx || !this.masterGain) return;
    this.resume();

    try {
      const now = this.ctx.currentTime;

      // 1. Noise buffer explosion
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.45);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.6, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.5);

      // 2. Sub-bass drop
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(130, now);
      sub.frequency.exponentialRampToValueAtTime(25, now + 0.45);

      subGain.gain.setValueAtTime(0.5, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      sub.connect(subGain);
      subGain.connect(this.masterGain);

      sub.start(now);
      sub.stop(now + 0.52);
    } catch {
      // Audio fallback
    }
  }

  public static playBonus(): void {
    if (!StorageManager.isSoundEnabled() || !this.ctx || !this.masterGain) return;
    this.resume();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.linearRampToValueAtTime(1046.50, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio fallback
    }
  }

  public static playIntroSplashChord(): void {
    if (!StorageManager.isSoundEnabled() || !this.ctx || !this.masterGain) return;
    this.resume();

    try {
      const now = this.ctx.currentTime;
      // Majestic celestial chord (D4, A4, F#5, A5)
      const freqs = [293.66, 440.00, 739.99, 880.00];
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.04;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 1.25);
      });
    } catch {
      // Audio fallback
    }
  }

  public static playPickup(type: 'MULTIPLIER' | 'WARP'): void {
    if (!StorageManager.isSoundEnabled() || !this.ctx || !this.masterGain) return;
    this.resume();

    try {
      const now = this.ctx.currentTime;
      if (type === 'MULTIPLIER') {
        // Crystalline ascending chime arpeggio
        [587.33, 739.99, 880.00, 1174.66].forEach((freq, idx) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const startTime = now + idx * 0.045;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.24, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(startTime);
          osc.stop(startTime + 0.3);
        });
      } else {
        // Sci-Fi Warp Conduit surge
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.35);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.42);
      }
    } catch {
      // Audio fallback
    }
  }

  public static playWarpHop(hop: number): void {
    if (!StorageManager.isSoundEnabled() || !this.ctx || !this.masterGain) return;
    this.resume();

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 440 + hop * 120; // 560, 680, 800, 920, 1040 Hz
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now); // perfect fifth harmonic

      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.24);
      osc2.stop(now + 0.24);
    } catch {
      // Audio fallback
    }
  }

  public static startAmbientDrone(): void {
    if (this.ambientGain || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      this.ambientGain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(48, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);

      this.ambientGain.gain.setValueAtTime(0.05, now);

      osc.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain);

      osc.start();
    } catch {
      // ignore
    }
  }
}

