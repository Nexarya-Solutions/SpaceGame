import { Container, Graphics } from 'pixi.js';

export type PlanetType = 'NORMAL' | 'MOVING' | 'HAZARD' | 'PULSING' | 'BOOST';

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

  // Moving properties
  public moveSpeed: number;
  public moveRange: number;
  public moveTime: number = 0;

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
    }
  }

  private renderCore(): void {
    const rimColor = this.getColor();
    const specularColor = this.getSpecularColor();
    const mantleColor = this.getDeepMantleColor();
    const r = this.radius;

    this.coreGraphics.clear();

    if (this.type === 'HAZARD') {
      // Polished Molten Ruby Celestial Star
      // 1. Soft atmospheric corona
      this.coreGraphics
        .circle(0, 0, r + 5)
        .fill({ color: 0xd9383a, alpha: 0.14 });

      // 2. Dark metallic garnet mantle
      this.coreGraphics
        .circle(0, 0, r)
        .fill({ color: mantleColor, alpha: 0.96 })
        .stroke({ color: 0xb32025, width: 2, alpha: 0.85 });

      // 3. Inner glowing celestial magma core
      this.coreGraphics
        .circle(0, 0, r * 0.58)
        .fill({ color: 0xd9383a, alpha: 0.82 });

      // 4. Glossy specular crescent highlight
      this.coreGraphics
        .circle(-r * 0.25, -r * 0.25, r * 0.42)
        .fill({ color: specularColor, alpha: 0.4 });

      // 5. Specular pin-point glint
      this.coreGraphics
        .circle(-r * 0.35, -r * 0.35, 1.4)
        .fill({ color: 0xffffff, alpha: 0.9 });

    } else {
      // Polished Crystalline Celestial Orb
      // 1. Soft outer bevel aura
      this.coreGraphics
        .circle(0, 0, r + 4)
        .fill({ color: rimColor, alpha: 0.12 });

      // 2. Deep planetary globe with metallic rim bevel
      this.coreGraphics
        .circle(0, 0, r)
        .fill({ color: mantleColor, alpha: 0.96 })
        .stroke({ color: rimColor, width: 1.8, alpha: 0.85 });

      // 3. Inner crystalline ring layer
      this.coreGraphics
        .circle(0, 0, r * 0.72)
        .stroke({ color: rimColor, width: 1.2, alpha: 0.35 });

      // 4. Polished marble specular crescent (shiny glass sheen)
      this.coreGraphics
        .circle(-r * 0.28, -r * 0.28, r * 0.45)
        .fill({ color: specularColor, alpha: 0.38 });

      // 5. Specular glint
      this.coreGraphics
        .circle(-r * 0.38, -r * 0.38, 1.5)
        .fill({ color: 0xffffff, alpha: 0.92 });

      // 6. Secondary subtle bottom-right ambient bounce
      this.coreGraphics
        .circle(r * 0.22, r * 0.22, r * 0.35)
        .fill({ color: rimColor, alpha: 0.12 });

      // Translucent crystalline rings for BOOST & MOVING planets
      if (this.type === 'BOOST' || this.type === 'MOVING') {
        this.coreGraphics
          .ellipse(0, 0, r * 1.55, r * 0.42)
          .stroke({ color: specularColor, width: 1.2, alpha: 0.4 });
      }
    }
  }

  public update(dt: number, time: number): void {
    // 1. Moving planet logic
    if (this.type === 'MOVING') {
      this.moveTime += dt * this.moveSpeed;
      this.x = this.startX + Math.sin(this.moveTime) * this.moveRange;
      this.container.position.x = this.x;
    }

    // 2. Pulsing planet logic
    if (this.type === 'PULSING') {
      this.pulsePhase += dt * 2.5;
      const pulseFactor = Math.sin(this.pulsePhase) * 14;
      this.captureRadius = this.baseCaptureRadius + pulseFactor;
    }

    // 3. Render semi-translucent glassmorphic aura & orbit ring
    const color = this.getColor();
    const auraAlpha = this.isCurrent ? 0.16 : 0.07 + Math.sin(time * 2 + this.id) * 0.025;

    this.auraGraphics.clear();
    // Glassmorphic capture aura with soft dual-layer translucency
    this.auraGraphics
      .circle(0, 0, this.captureRadius)
      .fill({ color: color, alpha: auraAlpha })
      .stroke({ color: color, width: 1, alpha: auraAlpha * 1.6 });

    // Subtle inner frosted band
    this.auraGraphics
      .circle(0, 0, this.captureRadius * 0.85)
      .stroke({ color: color, width: 0.8, alpha: auraAlpha * 0.6 });

    // Semi-translucent glassmorphic orbit guideline ring
    this.orbitRingGraphics.clear();
    if (this.type !== 'HAZARD') {
      const ringAlpha = this.isCurrent ? 0.32 : 0.16;
      // Soft outer diffuse line
      this.orbitRingGraphics
        .circle(0, 0, this.orbitRadius)
        .stroke({ color: color, width: 2.5, alpha: ringAlpha * 0.4 });
      // Crisp inner crystalline line
      this.orbitRingGraphics
        .circle(0, 0, this.orbitRadius)
        .stroke({ color: 0xffffff, width: 1, alpha: ringAlpha });
    }

    // 4. Update orbiting hazard moon/satellite (Polished crystalline asteroid)
    if (this.hasHazardMoon && this.hazardMoonGraphics) {
      this.hazardMoonAngle += this.hazardMoonSpeed * dt;
      const hx = Math.cos(this.hazardMoonAngle) * this.hazardMoonDistance;
      const hy = Math.sin(this.hazardMoonAngle) * this.hazardMoonDistance;

      this.hazardMoonX = this.x + hx;
      this.hazardMoonY = this.y + hy;

      this.hazardMoonGraphics.clear();

      // Subtle translucent moon orbit guideline
      this.hazardMoonGraphics
        .circle(0, 0, this.hazardMoonDistance)
        .stroke({ color: 0xd9383a, width: 1, alpha: 0.12 });

      // Polished dark garnet celestial bead (steady, clean, no strobing)
      this.hazardMoonGraphics
        .circle(hx, hy, this.hazardMoonRadius + 2)
        .fill({ color: 0xd9383a, alpha: 0.2 });

      this.hazardMoonGraphics
        .circle(hx, hy, this.hazardMoonRadius)
        .fill({ color: 0x24090e, alpha: 0.96 })
        .stroke({ color: 0xd9383a, width: 1.4, alpha: 0.85 });

      // Polished specular glint on hazard moon
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
