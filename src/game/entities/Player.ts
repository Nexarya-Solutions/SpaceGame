import { Container, Graphics } from 'pixi.js';
import { Planet } from './Planet';
import { ParticleManager } from './ParticleManager';

export type PlayerState = 'ORBITING' | 'LAUNCHED' | 'DEAD';

export interface CaptureResult {
  planet: Planet;
  isPerfect: boolean;
  distance: number;
}

export class Player {
  public container: Container;
  public state: PlayerState = 'ORBITING';

  // World coordinates
  public x: number = 0;
  public y: number = 0;
  public radius: number = 6.5;

  // Velocity (when launched)
  public vx: number = 0;
  public vy: number = 0;
  public launchSpeed: number = 660; // px/sec

  // Power-up & Special states
  public isMultiplierActive: boolean = false;
  public isWarping: boolean = false;

  // Orbit parameters
  public currentPlanet: Planet | null = null;
  public lastCapturedPlanetId: number = -1;
  public orbitAngle: number = 0;
  public currentOrbitRadius: number = 0;
  public targetOrbitRadius: number = 0;
  public orbitDirection: 1 | -1 = 1; // 1 = Clockwise, -1 = Counter-Clockwise
  public baseAngularSpeed: number = 3.6; // radians / sec

  // Visuals
  private playerGraphics: Graphics;
  private trailGraphics: Graphics;
  private trailPoints: Array<{ x: number; y: number; alpha: number }> = [];
  private maxTrailPoints: number = 22;

  constructor() {
    this.container = new Container();
    this.container.label = 'player-layer';

    this.trailGraphics = new Graphics();
    this.playerGraphics = new Graphics();

    this.container.addChild(this.trailGraphics);
    this.container.addChild(this.playerGraphics);
  }

  public initOnPlanet(planet: Planet): void {
    this.state = 'ORBITING';
    this.currentPlanet = planet;
    this.lastCapturedPlanetId = planet.id;
    this.orbitDirection = 1; // Start clockwise
    this.orbitAngle = -Math.PI / 2; // Start at top
    this.currentOrbitRadius = planet.orbitRadius;
    this.targetOrbitRadius = planet.orbitRadius;
    this.vx = 0;
    this.vy = 0;

    this.x = planet.x + Math.cos(this.orbitAngle) * this.currentOrbitRadius;
    this.y = planet.y + Math.sin(this.orbitAngle) * this.currentOrbitRadius;

    this.trailPoints = [];
    this.renderPlayer();
  }

  public launch(): boolean {
    if (this.state !== 'ORBITING' || !this.currentPlanet) {
      return false;
    }

    // Tangent unit vector:
    // If CW (1): (-sin(theta), cos(theta))
    // If CCW (-1): (sin(theta), -cos(theta))
    const dir = this.orbitDirection;
    const tangentX = -dir * Math.sin(this.orbitAngle);
    const tangentY = dir * Math.cos(this.orbitAngle);

    // Apply boost multiplier if launched from BOOST planet
    let speed = this.launchSpeed;
    if (this.currentPlanet.type === 'BOOST') {
      speed *= 1.25;
    }

    this.vx = tangentX * speed;
    this.vy = tangentY * speed;

    this.lastCapturedPlanetId = this.currentPlanet.id;
    this.currentPlanet.isCurrent = false;
    this.currentPlanet = null;
    this.state = 'LAUNCHED';

    return true;
  }

  public checkCapture(planets: Planet[]): CaptureResult | null {
    if (this.state !== 'LAUNCHED') return null;

    for (const planet of planets) {
      if (planet.id === this.lastCapturedPlanetId) {
        const distFromLast = Math.hypot(this.x - planet.x, this.y - planet.y);
        if (distFromLast < planet.captureRadius + 5) {
          continue;
        }
      }

      const dx = this.x - planet.x;
      const dy = this.y - planet.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= planet.captureRadius) {
        const cross = dx * this.vy - dy * this.vx;
        const newDirection: 1 | -1 = cross >= 0 ? 1 : -1;
        const isPerfect = Math.abs(dist - planet.orbitRadius) <= 12;

        return {
          planet,
          isPerfect,
          distance: dist
        };
      }
    }

    return null;
  }

  public snapToPlanet(planet: Planet, incomingDist: number, direction: 1 | -1): void {
    this.state = 'ORBITING';
    this.currentPlanet = planet;
    this.lastCapturedPlanetId = planet.id;
    this.orbitDirection = direction;
    planet.isVisited = true;
    planet.isCurrent = true;

    const dx = this.x - planet.x;
    const dy = this.y - planet.y;
    this.orbitAngle = Math.atan2(dy, dx);

    this.currentOrbitRadius = incomingDist;
    this.targetOrbitRadius = planet.orbitRadius;

    this.vx = 0;
    this.vy = 0;
  }

  public update(dt: number, particleManager: ParticleManager): void {
    if (this.state === 'DEAD') {
      this.trailGraphics.clear();
      this.playerGraphics.clear();
      return;
    }

    if (this.state === 'ORBITING' && this.currentPlanet) {
      const lerpSpeed = 12 * dt;
      this.currentOrbitRadius += (this.targetOrbitRadius - this.currentOrbitRadius) * lerpSpeed;

      let omega = (this.baseAngularSpeed * 65) / this.currentOrbitRadius;
      if (this.currentPlanet.type === 'BOOST') {
        omega *= 1.35;
      }

      this.orbitAngle += this.orbitDirection * omega * dt;

      if (this.orbitAngle > Math.PI) this.orbitAngle -= Math.PI * 2;
      if (this.orbitAngle < -Math.PI) this.orbitAngle += Math.PI * 2;

      this.x = this.currentPlanet.x + Math.cos(this.orbitAngle) * this.currentOrbitRadius;
      this.y = this.currentPlanet.y + Math.sin(this.orbitAngle) * this.currentOrbitRadius;

      // Subtle celestial stardust trail
      if (Math.random() < 0.35) {
        particleManager.emitTrail(this.x, this.y, 0xee2244, 0.7);
      }

    } else if (this.state === 'LAUNCHED') {
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Smooth stardust stream in flight
      particleManager.emitTrail(this.x, this.y, 0xee2244, 1.1);
      if (Math.random() < 0.3) {
        particleManager.emitTrail(this.x, this.y, 0xffd1dc, 0.8);
      }
    }

    // Maintain recent trail positions for smooth stardust fade
    this.trailPoints.unshift({ x: this.x, y: this.y, alpha: 1 });
    if (this.trailPoints.length > this.maxTrailPoints) {
      this.trailPoints.pop();
    }

    this.renderTrail();
    this.renderPlayer();
  }

  private renderTrail(): void {
    this.trailGraphics.clear();
    if (this.trailPoints.length < 2) return;

    const trailColor = this.isWarping ? 0xe0f2fe : (this.isMultiplierActive ? 0xdfb15b : 0xee2244);

    for (let i = 0; i < this.trailPoints.length - 1; i++) {
      const p1 = this.trailPoints[i];
      const p2 = this.trailPoints[i + 1];
      const progress = 1 - i / this.trailPoints.length;
      const alpha = progress * (this.isWarping ? 0.85 : 0.55);
      const width = Math.max(0.8, this.radius * progress * (this.isWarping ? 2.0 : 1.3));

      this.trailGraphics
        .moveTo(p1.x, p1.y)
        .lineTo(p2.x, p2.y)
        .stroke({
          color: trailColor,
          width: width,
          alpha: alpha,
          cap: 'round'
        });
    }
  }

  /**
   * Refined Comet:
   * A clean, crisp, solid single red dot with a soft, steady core highlight (no blinking, no rapid pulsating).
   * Displays shimmering golden aura when 2x Multiplier is active, and hyper-trail when Warping.
   */
  private renderPlayer(): void {
    this.playerGraphics.clear();

    const r = this.radius;

    // 0. Active Power-Up Auras
    if (this.isMultiplierActive) {
      // Subtle shimmering golden aura around player comet while active
      this.playerGraphics
        .circle(this.x, this.y, r + 7.5)
        .fill({ color: 0xdfb15b, alpha: 0.24 })
        .stroke({ color: 0xfff8e7, width: 1.2, alpha: 0.65 });
    }

    if (this.isWarping) {
      // Hyper-speed warp corona
      this.playerGraphics
        .circle(this.x, this.y, r + 9)
        .fill({ color: 0xe0f2fe, alpha: 0.32 })
        .stroke({ color: 0xffffff, width: 1.5, alpha: 0.85 });
    }

    // 1. Soft, steady outer celestial ruby halo (no blinking, steady alpha)
    this.playerGraphics
      .circle(this.x, this.y, r + 4.5)
      .fill({ color: 0xee2244, alpha: 0.16 });

    // 2. Smooth outer celestial rim
    this.playerGraphics
      .circle(this.x, this.y, r + 0.8)
      .fill({ color: 0x990022, alpha: 0.85 });

    // 3. Clean, crisp, solid single red dot core
    this.playerGraphics
      .circle(this.x, this.y, r)
      .fill({ color: 0xee2244, alpha: 1.0 });

    // 4. Shiny polished specular sheen (glossy celestial pearl highlight - steady)
    // Primary specular crescent sheen slightly offset towards upper-left
    this.playerGraphics
      .circle(this.x - 1.6, this.y - 1.6, r * 0.38)
      .fill({ color: 0xffffff, alpha: 0.85 });

    // Pin-point specular glint
    this.playerGraphics
      .circle(this.x - 2.1, this.y - 2.1, 0.9)
      .fill({ color: 0xffffff, alpha: 0.95 });
  }

  public kill(): void {
    this.state = 'DEAD';
    this.trailGraphics.clear();
    this.playerGraphics.clear();
  }

  public destroy(): void {
    this.container.destroy({ children: true });
  }
}
