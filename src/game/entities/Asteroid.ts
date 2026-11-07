import { Container, Graphics } from 'pixi.js';

export type AsteroidBehavior = 'STATIC' | 'DRIFTING' | 'ORBITING';

export interface AsteroidConfig {
  x: number;
  y: number;
  vx?: number;
  radius?: number;
  behavior?: AsteroidBehavior;
  // For orbiting asteroids
  orbitPlanetId?: number;
  orbitRadius?: number;
  orbitAngle?: number;
  orbitSpeed?: number;
}

export class Asteroid {
  public container: Container;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public radius: number;
  public rotationSpeed: number;
  public behavior: AsteroidBehavior;

  // Orbiting properties
  public orbitPlanetId: number = -1;
  public orbitRadius: number = 0;
  public orbitAngle: number = 0;
  public orbitSpeed: number = 0;

  private graphics: Graphics;
  private vertices: Array<{ x: number; y: number }> = [];

  constructor(config: AsteroidConfig) {
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx ?? 0;
    this.vy = (Math.random() - 0.5) * 8;
    this.radius = config.radius ?? (10 + Math.random() * 5);
    this.rotationSpeed = (Math.random() - 0.5) * 2.4;
    this.behavior = config.behavior ?? (this.vx !== 0 ? 'DRIFTING' : 'STATIC');

    this.orbitPlanetId = config.orbitPlanetId ?? -1;
    this.orbitRadius = config.orbitRadius ?? 0;
    this.orbitAngle = config.orbitAngle ?? Math.random() * Math.PI * 2;
    this.orbitSpeed = config.orbitSpeed ?? 1.4;

    this.container = new Container();
    this.container.label = `asteroid-${this.behavior}`;
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    // Create jagged asteroid polygon vertices
    const points = 7 + Math.floor(Math.random() * 3);
    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 * i) / points;
      const r = this.radius * (0.75 + Math.random() * 0.45);
      this.vertices.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r
      });
    }

    this.render();
    this.container.position.set(this.x, this.y);
  }

  private render(): void {
    this.graphics.clear();

    const r = this.radius;

    // 1. Subtle dark space dust halo
    this.graphics
      .circle(0, 0, r + 2.5)
      .fill({ color: 0x89c2d9, alpha: 0.08 });

    // 2. Polished obsidian rocky stone body
    this.graphics.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (let i = 1; i < this.vertices.length; i++) {
      this.graphics.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    this.graphics.closePath();
    this.graphics.fill({ color: 0x141824, alpha: 0.96 });
    this.graphics.stroke({ color: 0x48566d, width: 1.3, alpha: 0.85 });

    // 3. Shiny metallic veins (gold/platinum vein line across the rock)
    const v1 = this.vertices[1];
    const v4 = this.vertices[4 % this.vertices.length];
    this.graphics
      .moveTo(v1.x * 0.7, v1.y * 0.7)
      .lineTo(v4.x * 0.65, v4.y * 0.65)
      .stroke({ color: 0xdfb15b, width: 1.4, alpha: 0.85 });

    // Secondary vein branch
    const v2 = this.vertices[2];
    this.graphics
      .moveTo(0, 0)
      .lineTo(v2.x * 0.6, v2.y * 0.6)
      .stroke({ color: 0xe0f2fe, width: 1.0, alpha: 0.7 });

    // 4. Specular crystalline glints on stone facets
    this.graphics
      .circle(this.vertices[0].x * 0.35, this.vertices[0].y * 0.35, 1.4)
      .fill({ color: 0xffffff, alpha: 0.9 });

    this.graphics
      .circle(this.vertices[3 % this.vertices.length].x * 0.3, this.vertices[3 % this.vertices.length].y * 0.3, 1.0)
      .fill({ color: 0xfff8e7, alpha: 0.85 });
  }

  public update(
    dt: number,
    screenWidth: number,
    planetCoords?: { x: number; y: number }
  ): void {
    if (this.behavior === 'ORBITING' && planetCoords) {
      this.orbitAngle += this.orbitSpeed * dt;
      this.x = planetCoords.x + Math.cos(this.orbitAngle) * this.orbitRadius;
      this.y = planetCoords.y + Math.sin(this.orbitAngle) * this.orbitRadius;
    } else if (this.behavior === 'DRIFTING') {
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Wrap horizontally if drifting out of bounds
      if (this.vx > 0 && this.x > screenWidth + 40) {
        this.x = -40;
      } else if (this.vx < 0 && this.x < -40) {
        this.x = screenWidth + 40;
      }
    }

    this.container.rotation += this.rotationSpeed * dt;
    this.container.position.set(this.x, this.y);
  }

  public checkCollision(px: number, py: number, pRadius: number = 6.5): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    const hitDist = (this.radius * 0.88) + pRadius; // precise forgiving collision
    return dx * dx + dy * dy <= hitDist * hitDist;
  }

  public destroy(): void {
    this.container.destroy({ children: true });
  }
}
