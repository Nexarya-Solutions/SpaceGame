import { Container, Graphics } from 'pixi.js';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  radius: number;
  shrink: number;
  color: number;
  active: boolean;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  growthSpeed: number;
  alpha: number;
  strokeWidth: number;
  color: number;
  active: boolean;
}

export class ParticleManager {
  public container: Container;
  private particleGraphics: Graphics;
  private shockwaveGraphics: Graphics;

  private particles: Particle[] = [];
  private shockwaves: Shockwave[] = [];
  private maxParticles: number = 300;
  private maxShockwaves: number = 20;

  constructor() {
    this.container = new Container();
    this.container.label = 'particles-layer';

    this.shockwaveGraphics = new Graphics();
    this.particleGraphics = new Graphics();

    this.container.addChild(this.shockwaveGraphics);
    this.container.addChild(this.particleGraphics);

    // Pre-allocate particle pool
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        alpha: 0,
        decay: 0.02,
        radius: 2,
        shrink: 0.05,
        color: 0xee2244,
        active: false
      });
    }

    // Pre-allocate shockwave pool
    for (let i = 0; i < this.maxShockwaves; i++) {
      this.shockwaves.push({
        x: 0,
        y: 0,
        radius: 0,
        maxRadius: 80,
        growthSpeed: 4,
        alpha: 0,
        strokeWidth: 2,
        color: 0x89c2d9,
        active: false
      });
    }
  }

  public emitCaptureBurst(x: number, y: number, color: number = 0x89c2d9, count: number = 24): void {
    let spawned = 0;
    for (const p of this.particles) {
      if (!p.active) {
        const angle = (Math.PI * 2 * spawned) / count + (Math.random() - 0.5) * 0.4;
        const speed = 110 + Math.random() * 180;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.alpha = 0.9;
        p.decay = 0.018 + Math.random() * 0.018;
        p.radius = 2.2 + Math.random() * 2.2;
        p.shrink = 0.04;
        p.color = Math.random() > 0.4 ? color : 0xffffff;
        p.active = true;

        spawned++;
        if (spawned >= count) break;
      }
    }

    // Soft celestial shockwave ring
    this.emitShockwave(x, y, color, 80);
  }

  public emitCrashExplosion(x: number, y: number): void {
    const celestialGems = [0xee2244, 0xffb4a2, 0xffffff, 0x89c2d9, 0xdfb15b];
    let spawned = 0;
    const count = 55;
    for (const p of this.particles) {
      if (!p.active) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 70 + Math.random() * 320;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.alpha = 0.95;
        p.decay = 0.012 + Math.random() * 0.018;
        p.radius = 2 + Math.random() * 3.5;
        p.shrink = 0.03;
        p.color = celestialGems[Math.floor(Math.random() * celestialGems.length)];
        p.active = true;

        spawned++;
        if (spawned >= count) break;
      }
    }

    // Dual soft shockwave
    this.emitShockwave(x, y, 0xee2244, 110);
    this.emitShockwave(x, y, 0xffffff, 65);
  }

  public emitPickupBurst(x: number, y: number, color: number = 0xdfb15b): void {
    let spawned = 0;
    const count = 28;
    for (const p of this.particles) {
      if (!p.active) {
        const angle = (Math.PI * 2 * spawned) / count + (Math.random() - 0.5) * 0.3;
        const speed = 100 + Math.random() * 190;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.alpha = 0.95;
        p.decay = 0.022 + Math.random() * 0.02;
        p.radius = 2.2 + Math.random() * 2.0;
        p.shrink = 0.045;
        p.color = Math.random() > 0.3 ? color : 0xffffff;
        p.active = true;

        spawned++;
        if (spawned >= count) break;
      }
    }
    this.emitShockwave(x, y, color, 65);
  }

  public emitAsteroidShatter(x: number, y: number): void {
    const rockColors = [0x141824, 0x48566d, 0xdfb15b, 0xffffff];
    let spawned = 0;
    const count = 35;
    for (const p of this.particles) {
      if (!p.active) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 260;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.alpha = 0.95;
        p.decay = 0.02 + Math.random() * 0.02;
        p.radius = 2.5 + Math.random() * 3.0;
        p.shrink = 0.04;
        p.color = rockColors[Math.floor(Math.random() * rockColors.length)];
        p.active = true;

        spawned++;
        if (spawned >= count) break;
      }
    }
    this.emitShockwave(x, y, 0x48566d, 50);
  }

  public emitTrail(x: number, y: number, color: number = 0xee2244, speedRatio: number = 1): void {
    for (const p of this.particles) {
      if (!p.active) {
        p.x = x + (Math.random() - 0.5) * 2;
        p.y = y + (Math.random() - 0.5) * 2;
        p.vx = (Math.random() - 0.5) * 12;
        p.vy = (Math.random() - 0.5) * 12;
        p.alpha = 0.65;
        p.decay = 0.042 * speedRatio;
        p.radius = 1.9;
        p.shrink = 0.055;
        p.color = color;
        p.active = true;
        break;
      }
    }
  }

  public emitShockwave(x: number, y: number, color: number, maxRadius: number = 75): void {
    for (const s of this.shockwaves) {
      if (!s.active) {
        s.x = x;
        s.y = y;
        s.radius = 10;
        s.maxRadius = maxRadius;
        s.growthSpeed = maxRadius * 3.5; // reaches max in ~0.28s
        s.alpha = 0.9;
        s.strokeWidth = 3;
        s.color = color;
        s.active = true;
        break;
      }
    }
  }

  public update(dt: number): void {
    // 1. Update particles
    this.particleGraphics.clear();
    for (const p of this.particles) {
      if (p.active) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha -= p.decay * (dt * 60);
        p.radius = Math.max(0, p.radius - p.shrink * (dt * 60));

        if (p.alpha <= 0 || p.radius <= 0) {
          p.active = false;
        } else {
          this.particleGraphics
            .circle(p.x, p.y, p.radius)
            .fill({ color: p.color, alpha: p.alpha });
        }
      }
    }

    // 2. Update shockwaves
    this.shockwaveGraphics.clear();
    for (const s of this.shockwaves) {
      if (s.active) {
        s.radius += s.growthSpeed * dt;
        const progress = s.radius / s.maxRadius;
        s.alpha = Math.max(0, 1 - progress);
        s.strokeWidth = Math.max(0.5, 3 * (1 - progress * 0.7));

        if (progress >= 1 || s.alpha <= 0) {
          s.active = false;
        } else {
          this.shockwaveGraphics
            .circle(s.x, s.y, s.radius)
            .stroke({ color: s.color, width: s.strokeWidth, alpha: s.alpha });
        }
      }
    }
  }

  public clear(): void {
    for (const p of this.particles) p.active = false;
    for (const s of this.shockwaves) s.active = false;
    this.particleGraphics.clear();
    this.shockwaveGraphics.clear();
  }

  public destroy(): void {
    this.clear();
    this.container.destroy({ children: true });
  }
}

