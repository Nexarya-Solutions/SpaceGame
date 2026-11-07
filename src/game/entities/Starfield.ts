import { Container, Graphics } from 'pixi.js';

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  color: number;
}

export class Starfield {
  public container: Container;
  private layerBack: Graphics;
  private layerMid: Graphics;
  private layerFront: Graphics;

  private starsBack: Star[] = [];
  private starsMid: Star[] = [];
  private starsFront: Star[] = [];

  private width: number = 800;
  private height: number = 1200;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.container = new Container();
    this.container.label = 'starfield';

    this.layerBack = new Graphics();
    this.layerMid = new Graphics();
    this.layerFront = new Graphics();

    this.container.addChild(this.layerBack);
    this.container.addChild(this.layerMid);
    this.container.addChild(this.layerFront);

    this.initStars();
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.initStars();
  }

  private initStars(): void {
    this.starsBack = [];
    this.starsMid = [];
    this.starsFront = [];

    const starColors = [0xffffff, 0xe0f2fe, 0xfff8e7, 0xd4e4f7];

    // Distant background stars (70 stars)
    for (let i = 0; i < 70; i++) {
      this.starsBack.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 0.8 + Math.random() * 0.8,
        alpha: 0.2 + Math.random() * 0.3,
        baseAlpha: 0.2 + Math.random() * 0.3,
        twinkleSpeed: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }

    // Midfield stars (45 stars)
    for (let i = 0; i < 45; i++) {
      this.starsMid.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 1.2 + Math.random() * 1.0,
        alpha: 0.35 + Math.random() * 0.35,
        baseAlpha: 0.35 + Math.random() * 0.35,
        twinkleSpeed: 1.8 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }

    // Foreground glowing diamond sparkles (20 stars)
    for (let i = 0; i < 20; i++) {
      this.starsFront.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 1.6 + Math.random() * 1.0,
        alpha: 0.55 + Math.random() * 0.35,
        baseAlpha: 0.55 + Math.random() * 0.35,
        twinkleSpeed: 2.5 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        color: 0xffffff
      });
    }
  }

  public update(cameraY: number, dt: number, time: number): void {
    // Wrap around screen height seamlessly
    const h = this.height;

    // 1. Back layer (parallax 0.08)
    this.layerBack.clear();
    const offsetYBack = (-cameraY * 0.08) % h;
    for (const s of this.starsBack) {
      let py = (s.y + offsetYBack) % h;
      if (py < 0) py += h;
      const alpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.phase) * 0.15;
      this.layerBack.circle(s.x, py, s.radius).fill({ color: s.color, alpha });
    }

    // 2. Mid layer (parallax 0.25)
    this.layerMid.clear();
    const offsetYMid = (-cameraY * 0.25) % h;
    for (const s of this.starsMid) {
      let py = (s.y + offsetYMid) % h;
      if (py < 0) py += h;
      const alpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.phase) * 0.25;
      this.layerMid.circle(s.x, py, s.radius).fill({ color: s.color, alpha });
    }

    // 3. Front layer (parallax 0.55)
    this.layerFront.clear();
    const offsetYFront = (-cameraY * 0.55) % h;
    for (const s of this.starsFront) {
      let py = (s.y + offsetYFront) % h;
      if (py < 0) py += h;
      const alpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.phase) * 0.3;
      this.layerFront.circle(s.x, py, s.radius).fill({ color: s.color, alpha });
      // Extra soft halo
      this.layerFront.circle(s.x, py, s.radius * 2.2).fill({ color: s.color, alpha: alpha * 0.25 });
    }
  }

  public destroy(): void {
    this.container.destroy({ children: true });
  }
}

