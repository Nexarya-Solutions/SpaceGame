import { Container, Graphics } from 'pixi.js';

export type PlanetType =
  | 'NORMAL'
  | 'MOVING'
  | 'HAZARD'
  | 'PULSING'
  | 'BOOST'
  | 'DECAYING'
  | 'VERTICAL'
  | 'REPULSOR';

export interface PlanetConfig {
  id: number;
  x: number;
  y: number;
  radius: number;
  orbitRadius: number;
  captureRadius: number;
  type: PlanetType;
  moveSpeed?: number;
  moveRange?: number;
  hasHazardMoon?: boolean;
  hazardMoonSpeed?: number;
  hazardMoonDistance?: number;
  verticalSpeed?: number;
  verticalRange?: number;
  decayRate?: number;
  repulsorStrength?: number;
}

export class Planet {
  public id: number;
  public container: Container;
  public startX: number;
  public startY: number;
  public x: number;
  public y: number;
  public radius: number;
  public orbitRadius: number;
  public captureRadius: number;
  public baseCaptureRadius: number;
  public type: PlanetType;

  // Moving properties (Horizontal)
  public moveSpeed: number;
  public moveRange: number;
  public moveTime: number = 0;

  // Vertical Oscillation properties
  public verticalSpeed: number;
  public verticalRange: number;
  public verticalTime: number = Math.random() * Math.PI * 2;

  // Decaying / Shrinking Planet properties
  public decayRate: number;
  public isDestroyed: boolean = false;

  // Repulsor properties
  public repulsorStrength: number;
  public repulsorWaveTime: number = 0;
  public hasRepulsed: boolean = false;

  // Hazard moon properties
  public hasHazardMoon: boolean = false;
  public hazardMoonAngle: number = 0;
  public hazardMoonSpeed: number = 2.0;
  public hazardMoonDistance: number = 0;
  public hazardMoonRadius: number = 8;
  public hazardMoonX: number = 0;
  public hazardMoonY: number = 0;

  // Visuals
  private auraGraphics: Graphics;
  private orbitRingGraphics: Graphics;
  private coreGraphics: Graphics;
  private hazardMoonGraphics: Graphics | null = null;
  private pulsePhase: number = Math.random() * Math.PI * 2;
  public isVisited: boolean = false;
  public isCurrent: boolean = false;

  constructor(config: PlanetConfig) {
    this.id = config.id;
    this.startX = config.x;
    this.startY = config.y;
    this.x = config.x;
    this.y = config.y;
    this.radius = config.radius;
    this.orbitRadius = config.orbitRadius;
    this.captureRadius = config.captureRadius;
    this.baseCaptureRadius = config.captureRadius;
    this.type = config.type;
    this.moveSpeed = config.moveSpeed ?? 1.5;
    this.moveRange = config.moveRange ?? 70;
    this.verticalSpeed = config.verticalSpeed ?? 1.6;
    this.verticalRange = config.verticalRange ?? 42;
    this.decayRate = config.decayRate ?? 6.2;
    this.repulsorStrength = config.repulsorStrength ?? 1750;
    this.hasHazardMoon = !!config.hasHazardMoon;
    this.hazardMoonSpeed = config.hazardMoonSpeed ?? 2.2;
    this.hazardMoonDistance = config.hazardMoonDistance ?? (this.orbitRadius + 22);

    this.container = new Container();
    this.container.label = `planet-${this.id}`;
    this.container.position.set(this.x, this.y);

    this.auraGraphics = new Graphics();
    this.orbitRingGraphics = new Graphics();
    this.coreGraphics = new Graphics();

    this.container.addChild(this.auraGraphics);
    this.container.addChild(this.orbitRingGraphics);
    this.container.addChild(this.coreGraphics);

    if (this.hasHazardMoon) {
      this.hazardMoonGraphics = new Graphics();
      this.container.addChild(this.hazardMoonGraphics);
    }

    this.renderCore();
  }

  /**
   * Shiny / Polished Celestial Palette
   */
  public getColor(): number {
    switch (this.type) {
      case 'NORMAL':
        return 0x89c2d9; // Polished crystalline sapphire
      case 'MOVING':
        return 0x74c69d; // Polished celestial jade
      case 'HAZARD':
        return 0xd9383a; // Molten ruby / garnet celestial star
      case 'PULSING':
        return 0xb5838d; // Amethyst quartz
      case 'BOOST':
        return 0xdfb15b; // Champagne gold
      case 'DECAYING':
        return 0xf59e0b; // Solar ember / collapsing gold
      case 'VERTICAL':
        return 0x06b6d4; // Glacial cyan sapphire
      case 'REPULSOR':
        return 0xd946ef; // Electric magenta anti-gravity singularity
    }
  }

  public getSpecularColor(): number {
    switch (this.type) {
      case 'NORMAL':
        return 0xe0f2fe; // Diamond luster
      case 'MOVING':
        return 0xd8f3dc; // Silver sheen
      case 'HAZARD':
        return 0xffc0ad; // Warm pearl
      case 'PULSING':
        return 0xf3e8ff; // Lilac glint
      case 'BOOST':
        return 0xfff8e7; // Golden gleam
      case 'DECAYING':
        return 0xfef3c7; // Sunlit amber
      case 'VERTICAL':
        return 0xcffafe; // Crisp ice
      case 'REPULSOR':
        return 0xfae8ff; // Radiant prism
    }
  }

  public getDeepMantleColor(): number {
    switch (this.type) {
      case 'NORMAL':
        return 0x0f1c2e; // Deep astral obsidian
      case 'MOVING':
        return 0x0d231b; // Deep jade obsidian
      case 'HAZARD':
        return 0x24090e; // Deep garnet obsidian
      case 'PULSING':
        return 0x1f122e; // Deep amethyst
      case 'BOOST':
        return 0x261b09; // Deep bronze
      case 'DECAYING':
        return 0x291804; // Ash obsidian
      case 'VERTICAL':
        return 0x082f49; // Abyssal navy
      case 'REPULSOR':
        return 0x3b0764; // Dark violet singularity
    }
  }

  public renderCore(): void {
    const rimColor = this.getColor();
    const specularColor = this.getSpecularColor();
    const mantleColor = this.getDeepMantleColor();
    const r = Math.max(3, this.radius);

    this.coreGraphics.clear();

    if (this.type === 'HAZARD') {
      // Polished Molten Ruby Celestial Star
      this.coreGraphics
        .circle(0, 0, r + 5)
        .fill({ color: 0xd9383a, alpha: 0.14 });

      this.coreGraphics
        .circle(0, 0, r)
        .fill({ color: mantleColor, alpha: 0.96 })
        .stroke({ color: 0xb32025, width: 2, alpha: 0.85 });

      this.coreGraphics
        .circle(0, 0, r * 0.58)
        .fill({ color: 0xd9383a, alpha: 0.82 });

      this.coreGraphics
        .circle(-r * 0.25, -r * 0.25, r * 0.42)
        .fill({ color: specularColor, alpha: 0.4 });

      this.coreGraphics
        .circle(-r * 0.35, -r * 0.35, 1.4)
        .fill({ color: 0xffffff, alpha: 0.9 });

    } else if (this.type === 'REPULSOR') {
      // Anti-Gravity Singularity Node
      // Outer inverse force rings
      this.coreGraphics
        .circle(0, 0, r + 6)
        .fill({ color: 0xd946ef, alpha: 0.18 })
        .stroke({ color: 0xf0abfc, width: 1.5, alpha: 0.7 });

      this.coreGraphics
        .circle(0, 0, r)
        .fill({ color: mantleColor, alpha: 0.95 })
        .stroke({ color: 0xd946ef, width: 2.2, alpha: 0.9 });

      // Pulsing anti-gravity core
      this.coreGraphics
        .circle(0, 0, r * 0.5)
        .fill({ color: 0xf472b6, alpha: 0.85 });

      // Core singularity center
      this.coreGraphics
        .circle(0, 0, r * 0.22)
        .fill({ color: 0xffffff, alpha: 0.95 });

    } else if (this.type === 'DECAYING') {
      // Decaying / Shrinking Collapsing Planet
      this.coreGraphics
        .circle(0, 0, r + 4)
        .fill({ color: 0xf59e0b, alpha: 0.2 });

      this.coreGraphics
        .circle(0, 0, r)
        .fill({ color: mantleColor, alpha: 0.96 })
        .stroke({ color: 0xf59e0b, width: 2, alpha: 0.9 });

      // Inner melting amber core
      this.coreGraphics
        .circle(0, 0, r * 0.55)
        .fill({ color: 0xfbbf24, alpha: 0.8 });

      // Specular glint
      this.coreGraphics
        .circle(-r * 0.28, -r * 0.28, r * 0.4)
        .fill({ color: specularColor, alpha: 0.4 });

    } else {
      // Polished Crystalline Celestial Orb
      this.coreGraphics
        .circle(0, 0, r + 4)
        .fill({ color: rimColor, alpha: 0.12 });

      this.coreGraphics
        .circle(0, 0, r)
        .fill({ color: mantleColor, alpha: 0.96 })
        .stroke({ color: rimColor, width: 1.8, alpha: 0.85 });

      this.coreGraphics
        .circle(0, 0, r * 0.72)
        .stroke({ color: rimColor, width: 1.2, alpha: 0.35 });

      this.coreGraphics
        .circle(-r * 0.28, -r * 0.28, r * 0.45)
        .fill({ color: specularColor, alpha: 0.38 });

      this.coreGraphics
        .circle(-r * 0.38, -r * 0.38, 1.5)
        .fill({ color: 0xffffff, alpha: 0.92 });

      this.coreGraphics
        .circle(r * 0.22, r * 0.22, r * 0.35)
        .fill({ color: rimColor, alpha: 0.12 });

      if (this.type === 'BOOST' || this.type === 'MOVING' || this.type === 'VERTICAL') {
        this.coreGraphics
          .ellipse(0, 0, r * 1.55, r * 0.42)
          .stroke({ color: specularColor, width: 1.2, alpha: 0.4 });
      }
    }
  }

  public update(dt: number, time: number): void {
    if (this.isDestroyed) return;

    // 1. Moving planet logic (Horizontal)
    if (this.type === 'MOVING') {
      this.moveTime += dt * this.moveSpeed;
      this.x = this.startX + Math.sin(this.moveTime) * this.moveRange;
      this.container.position.x = this.x;
    }

    // 2. Vertical oscillating planet logic
    if (this.type === 'VERTICAL') {
      this.verticalTime += dt * this.verticalSpeed;
      this.y = this.startY + Math.sin(this.verticalTime) * this.verticalRange;
      this.container.position.y = this.y;
    }

    // 3. Pulsing planet logic
    if (this.type === 'PULSING') {
      this.pulsePhase += dt * 2.5;
      const pulseFactor = Math.sin(this.pulsePhase) * 14;
      this.captureRadius = this.baseCaptureRadius + pulseFactor;
    }

    // 4. Decaying / Shrinking planet logic (shrinks when player orbits it)
    if (this.type === 'DECAYING' && this.isCurrent) {
      this.radius -= this.decayRate * dt;
      this.orbitRadius -= this.decayRate * dt;
      this.captureRadius = Math.max(this.radius + 10, this.captureRadius - this.decayRate * dt);
      this.renderCore();

      if (this.radius <= 6) {
        this.isDestroyed = true;
        this.coreGraphics.clear();
        this.auraGraphics.clear();
        this.orbitRingGraphics.clear();
        if (this.hazardMoonGraphics) this.hazardMoonGraphics.clear();
      }
    }

    // 5. Render aura & orbit rings
    const color = this.getColor();
    const auraAlpha = this.isCurrent ? 0.18 : 0.08 + Math.sin(time * 2 + this.id) * 0.025;

    this.auraGraphics.clear();
    this.orbitRingGraphics.clear();

    if (this.type === 'REPULSOR') {
      // Repulsor Node: Outward radiating force waves
      this.repulsorWaveTime += dt * 3;
      const wavePhase = (this.repulsorWaveTime % 1);
      const waveRadius = this.radius + wavePhase * (this.captureRadius - this.radius);
      const waveAlpha = (1 - wavePhase) * 0.6;

      this.auraGraphics
        .circle(0, 0, this.captureRadius)
        .fill({ color: 0xd946ef, alpha: 0.06 })
        .stroke({ color: 0xf472b6, width: 1.5, alpha: 0.4 });

      // Outward ripple ring
      this.auraGraphics
        .circle(0, 0, waveRadius)
        .stroke({ color: 0xffffff, width: 2, alpha: waveAlpha });

    } else {
      // Standard / Decaying / Vertical glassmorphic capture aura
      this.auraGraphics
        .circle(0, 0, this.captureRadius)
        .fill({ color: color, alpha: auraAlpha })
        .stroke({ color: color, width: 1, alpha: auraAlpha * 1.6 });

      this.auraGraphics
        .circle(0, 0, this.captureRadius * 0.85)
        .stroke({ color: color, width: 0.8, alpha: auraAlpha * 0.6 });

      // Orbit guideline ring
      if (this.type !== 'HAZARD') {
        const ringAlpha = this.isCurrent ? 0.32 : 0.16;
        this.orbitRingGraphics
          .circle(0, 0, this.orbitRadius)
          .stroke({ color: color, width: 2.5, alpha: ringAlpha * 0.4 });
        this.orbitRingGraphics
          .circle(0, 0, this.orbitRadius)
          .stroke({ color: 0xffffff, width: 1, alpha: ringAlpha });
      }
    }

    // 6. Orbiting hazard moon logic
    if (this.hasHazardMoon && this.hazardMoonGraphics) {
      this.hazardMoonAngle += this.hazardMoonSpeed * dt;
      const hx = Math.cos(this.hazardMoonAngle) * this.hazardMoonDistance;
      const hy = Math.sin(this.hazardMoonAngle) * this.hazardMoonDistance;

      this.hazardMoonX = this.x + hx;
      this.hazardMoonY = this.y + hy;

      this.hazardMoonGraphics.clear();

      this.hazardMoonGraphics
        .circle(0, 0, this.hazardMoonDistance)
        .stroke({ color: 0xd9383a, width: 1, alpha: 0.12 });

      this.hazardMoonGraphics
        .circle(hx, hy, this.hazardMoonRadius + 2)
        .fill({ color: 0xd9383a, alpha: 0.2 });

      this.hazardMoonGraphics
        .circle(hx, hy, this.hazardMoonRadius)
        .fill({ color: 0x24090e, alpha: 0.96 })
        .stroke({ color: 0xd9383a, width: 1.4, alpha: 0.85 });

      this.hazardMoonGraphics
        .circle(hx - 1.8, hy - 1.8, 1.6)
        .fill({ color: 0xffffff, alpha: 0.85 });
    }
  }

  public checkHazardMoonCollision(playerX: number, playerY: number, playerRadius: number = 6.5): boolean {
    if (!this.hasHazardMoon) return false;
    const dx = playerX - this.hazardMoonX;
    const dy = playerY - this.hazardMoonY;
    const distSq = dx * dx + dy * dy;
    const hitDist = this.hazardMoonRadius + playerRadius;
    return distSq <= hitDist * hitDist;
  }

  public destroy(): void {
    this.container.destroy({ children: true });
  }
}
