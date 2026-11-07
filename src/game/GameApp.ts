import { Application, Container } from 'pixi.js';
import { Player } from './entities/Player';
import { Planet, PlanetType } from './entities/Planet';
import { ParticleManager } from './entities/ParticleManager';
import { Starfield } from './entities/Starfield';
import { Asteroid } from './entities/Asteroid';
import { Pickup, PickupType } from './entities/Pickup';
import { SoundManager } from './audio/SoundManager';
import { HapticsManager } from './services/HapticsManager';
import { StorageManager } from './services/StorageManager';
import { gameEvents, GAME_EVENTS, GameState } from './events/GameEvents';

export class GameApp {
  public app: Application;
  private containerElement: HTMLElement;
  private isDestroyed: boolean = false;

  // Scene Hierarchy
  private worldContainer: Container;
  private starfield: Starfield | null = null;
  private planetLayer: Container;
  private pickupLayer: Container;
  private asteroidLayer: Container;
  private particleManager: ParticleManager;
  private player: Player;

  // Entities
  private planets: Planet[] = [];
  private asteroids: Asteroid[] = [];
  private pickups: Pickup[] = [];
  private nextPlanetId: number = 0;
  private nextPickupId: number = 0;
  private highestPlanetY: number = 0;

  // Camera & Viewport
  private cameraY: number = 0;
  private targetCameraY: number = 0;
  private screenShakeTime: number = 0;
  private screenShakeMagnitude: number = 0;

  // Game Progression & Scoring
  public gameState: GameState = 'MENU';
  public isPaused: boolean = false;
  private score: number = 0;
  private highScore: number = 0;
  private combo: number = 0;
  private maxCombo: number = 0;
  private totalOrbitsCount: number = 0;
  private totalElapsedTime: number = 0;

  // Power-Up States (PIXI.Ticker delta time driven)
  public isMultiplierActive: boolean = false;
  private multiplierRemaining: number = 0;
  private readonly MULTIPLIER_DURATION: number = 10.0;

  // Chain Warp Conduit (Auto-Jump 5 Orbits)
  public isWarpActive: boolean = false;
  private warpHopCount: number = 0;
  private readonly WARP_MAX_HOPS: number = 5;
  private warpPhase: 'TRAVELING' | 'ORBITING_BRIEFLY' = 'TRAVELING';
  private warpOrbitTimer: number = 0;
  private warpTargetPlanet: Planet | null = null;
  private warpTargetList: Planet[] = [];

  constructor(containerElement: HTMLElement) {
    this.containerElement = containerElement;
    this.app = new Application();
    this.worldContainer = new Container();
    this.planetLayer = new Container();
    this.pickupLayer = new Container();
    this.asteroidLayer = new Container();
    this.particleManager = new ParticleManager();
    this.player = new Player();
  }

  public async init(): Promise<void> {
    const width = this.containerElement.clientWidth || window.innerWidth;
    const height = this.containerElement.clientHeight || window.innerHeight;

    try {
      await this.app.init({
        width,
        height,
        backgroundColor: 0x070a14,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true
      });
    } catch (e) {
      console.warn('Pixi init failed or aborted:', e);
      return;
    }

    if (this.isDestroyed) {
      this.destroy();
      return;
    }

    if (this.app.canvas && !this.containerElement.contains(this.app.canvas)) {
      this.containerElement.appendChild(this.app.canvas);
    }

    // Initialize Services
    try {
      await StorageManager.init();
    } catch (e) {
      console.warn('StorageManager init error:', e);
    }

    if (this.isDestroyed) {
      this.destroy();
      return;
    }

    this.highScore = StorageManager.getHighScore();
    SoundManager.init();

    // Setup Scene Graph
    this.starfield = new Starfield(width, height);
    this.app.stage.addChild(this.starfield.container);

    this.worldContainer.addChild(this.planetLayer);
    this.worldContainer.addChild(this.pickupLayer);
    this.worldContainer.addChild(this.asteroidLayer);
    this.worldContainer.addChild(this.particleManager.container);
    this.worldContainer.addChild(this.player.container);
    this.app.stage.addChild(this.worldContainer);

    // Bind Game Loop
    this.app.ticker.add(this.update, this);

    // Setup Initial World
    this.resetWorld();

    // Start with Menu state
    this.setGameState('MENU');

    // Start subtle ambient sound
    SoundManager.startAmbientDrone();
  }

  public setGameState(newState: GameState): void {
    this.gameState = newState;
    gameEvents.emit(GAME_EVENTS.STATE_CHANGE, newState);
  }

  public pause(): void {
    if (this.isPaused) return;
    this.isPaused = true;
    try {
      this.app.ticker.stop();
    } catch {
      // ignore
    }
    gameEvents.emit(GAME_EVENTS.GAME_PAUSED);
  }

  public resume(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    try {
      this.app.ticker.start();
    } catch {
      // ignore
    }
    gameEvents.emit(GAME_EVENTS.GAME_RESUMED);
  }

  public handleInput(): void {
    if (this.isPaused) return;
    if (this.isWarpActive) return; // Input locked during rapid warp transit

    SoundManager.resume();

    if (this.gameState === 'MENU') {
      this.setGameState('PLAYING');
      this.launchPlayer();
    } else if (this.gameState === 'PLAYING') {
      this.launchPlayer();
    }
  }

  private launchPlayer(): void {
    if (this.player.state === 'ORBITING') {
      const launched = this.player.launch();
      if (launched) {
        SoundManager.playLaunch();
        HapticsManager.launchImpact();
        gameEvents.emit(GAME_EVENTS.LAUNCH);
      }
    }
  }

  public restartGame(): void {
    if (this.isPaused) {
      this.isPaused = false;
      try {
        this.app.ticker.start();
      } catch {
        // ignore
      }
    }
    this.resetWorld();
    this.setGameState('PLAYING');
  }

  private resetWorld(): void {
    // 1. Clear existing planets
    for (const p of this.planets) {
      p.destroy();
    }
    this.planets = [];
    this.planetLayer.removeChildren();

    // 2. Clear existing asteroids
    for (const a of this.asteroids) {
      a.destroy();
    }
    this.asteroids = [];
    this.asteroidLayer.removeChildren();

    // 3. Clear existing pickups
    for (const pk of this.pickups) {
      pk.destroy();
    }
    this.pickups = [];
    this.pickupLayer.removeChildren();

    // 4. Clear particles
    this.particleManager.clear();

    // 5. Reset scores and timers
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.totalOrbitsCount = 0;
    this.nextPlanetId = 0;
    this.nextPickupId = 0;
    this.totalElapsedTime = 0;

    // Reset power-ups
    this.isMultiplierActive = false;
    this.multiplierRemaining = 0;
    this.player.isMultiplierActive = false;
    gameEvents.emit(GAME_EVENTS.MULTIPLIER_POWERUP_UPDATE, {
      active: false,
      remaining: 0,
      total: this.MULTIPLIER_DURATION
    });

    // Reset warp
    this.isWarpActive = false;
    this.warpHopCount = 0;
    this.player.isWarping = false;
    this.warpTargetPlanet = null;
    this.warpTargetList = [];
    gameEvents.emit(GAME_EVENTS.WARP_SEQUENCE_UPDATE, {
      active: false,
      hop: 0,
      totalHops: this.WARP_MAX_HOPS
    });

    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    // 6. Initial anchor planet at center
    const initialPlanet = new Planet({
      id: this.nextPlanetId++,
      x: screenWidth * 0.5,
      y: screenHeight * 0.5,
      radius: 32,
      orbitRadius: 75,
      captureRadius: 105,
      type: 'NORMAL'
    });
    initialPlanet.isVisited = true;
    initialPlanet.isCurrent = true;

    this.planets.push(initialPlanet);
    this.planetLayer.addChild(initialPlanet.container);

    // Initial player state locked into first planet
    this.player.initOnPlanet(initialPlanet);

    // Highest planet tracking
    this.highestPlanetY = initialPlanet.y;

    // Camera initial position centered on initial planet
    this.cameraY = initialPlanet.y - screenHeight * 0.5;
    this.targetCameraY = this.cameraY;
    this.worldContainer.position.y = -this.cameraY;

    // Generate upcoming starting sequence (3-4 planets ahead)
    this.generatePlanetsAhead();

    // Notify UI
    this.emitScoreUpdate(false);
  }

  private generatePlanetsAhead(): void {
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;
    const horizon = this.cameraY - screenHeight * 1.5;

    while (this.highestPlanetY > horizon) {
      const id = this.nextPlanetId++;

      // Difficulty Balancing (Progression Curve)
      let gapY: number;
      let captureRadiusBuffer: number;
      let type: PlanetType = 'NORMAL';
      let hasHazardMoon = false;

      if (id <= 6) {
        // EARLY GAME (Score 0-10): Closer together, wide clear angles, generous capture
        gapY = 195 + Math.random() * 35;
        captureRadiusBuffer = 36;
      } else if (id <= 20) {
        // MID GAME (Score 10-30): Varied spacing, moving/pulsing celestial bodies
        gapY = 210 + Math.random() * 45;
        captureRadiusBuffer = 28;

        const roll = Math.random();
        if (roll < 0.35) {
          type = 'MOVING';
        } else if (roll < 0.55) {
          type = 'PULSING';
        } else if (roll < 0.72) {
          type = 'BOOST';
        }
      } else {
        // LATE GAME (Score 30+): Deliberate timing, hazard stars, orbiting satellites
        gapY = 220 + Math.random() * 55;
        captureRadiusBuffer = 24;

        const roll = Math.random();
        if (roll < 0.2) {
          type = 'HAZARD';
        } else if (roll < 0.5) {
          type = 'MOVING';
        } else if (roll < 0.7) {
          type = 'PULSING';
        } else if (roll < 0.85) {
          type = 'BOOST';
        }

        if (type !== 'HAZARD' && Math.random() < 0.3) {
          hasHazardMoon = true;
        }
      }

      const newY = this.highestPlanetY - gapY;

      // Calculate horizontal position
      const margin = 80;
      const minX = margin;
      const maxX = screenWidth - margin;

      const prevPlanet = this.planets[this.planets.length - 1];
      let newX: number;
      if (prevPlanet) {
        const side = prevPlanet.x < screenWidth * 0.5 ? 1 : -1;
        newX = prevPlanet.x + side * (90 + Math.random() * 110);
        newX = Math.max(minX, Math.min(maxX, newX));
      } else {
        newX = screenWidth * 0.5;
      }

      const radius = 27 + Math.random() * 5;
      const orbitRadius = radius + 32 + Math.random() * 8;
      const captureRadius = orbitRadius + captureRadiusBuffer;

      // Create and store planet
      const newPlanet = new Planet({
        id,
        x: newX,
        y: newY,
        radius,
        orbitRadius,
        captureRadius,
        type,
        moveSpeed: 1.2 + Math.random() * 1.3,
        moveRange: 55 + Math.random() * 35,
        hasHazardMoon,
        hazardMoonSpeed: (Math.random() > 0.5 ? 1 : -1) * (1.8 + Math.random() * 1.0),
        hazardMoonDistance: orbitRadius + 22
      });

      this.planets.push(newPlanet);
      this.planetLayer.addChild(newPlanet.container);
      this.highestPlanetY = newY;

      // SPAWN POWER-UPS (Magnet & Chain Warp) - Mid & Late Game
      if (id > 5) {
        const midY = newY + gapY * 0.5;
        const midX = (prevPlanet.x + newX) * 0.5 + (Math.random() - 0.5) * 50;
        const clampedX = Math.max(70, Math.min(screenWidth - 70, midX));

        const pickupRoll = Math.random();
        if (pickupRoll < 0.26) {
          // Magnet / 2x Multiplier Core (Golden crystal)
          const pickup = new Pickup(this.nextPickupId++, clampedX, midY, 'MULTIPLIER');
          this.pickups.push(pickup);
          this.pickupLayer.addChild(pickup.container);
        } else if (id > 8 && pickupRoll < 0.40) {
          // Chain Warp Conduit (Prismatic warp node)
          const pickup = new Pickup(this.nextPickupId++, clampedX, midY, 'WARP');
          this.pickups.push(pickup);
          this.pickupLayer.addChild(pickup.container);
        }
      }

      // SPAWN ASTEROID DEBRIS (Static & Orbiting Hazards)
      if (id > 7 && id <= 20) {
        // Mid-game: Static asteroids in dead zones
        if (Math.random() < 0.35) {
          const asteroidY = newY + gapY * 0.45;
          const deadZoneX = prevPlanet.x < screenWidth * 0.5 ? screenWidth - 75 : 75;
          const asteroid = new Asteroid({
            x: deadZoneX + (Math.random() - 0.5) * 20,
            y: asteroidY,
            behavior: 'STATIC',
            radius: 9 + Math.random() * 4
          });
          this.asteroids.push(asteroid);
          this.asteroidLayer.addChild(asteroid.container);
        }
      } else if (id > 20) {
        // Late-game: Orbiting asteroids or drifting debris
        const astRoll = Math.random();
        if (astRoll < 0.32 && type !== 'HAZARD' && !hasHazardMoon) {
          // Orbiting asteroid around planet on safe hazard path
          const orbitDist = orbitRadius + 28;
          const asteroid = new Asteroid({
            x: newX + orbitDist,
            y: newY,
            behavior: 'ORBITING',
            orbitPlanetId: id,
            orbitRadius: orbitDist,
            orbitAngle: Math.random() * Math.PI * 2,
            orbitSpeed: (Math.random() > 0.5 ? 1 : -1) * (1.6 + Math.random() * 0.8),
            radius: 8 + Math.random() * 3
          });
          this.asteroids.push(asteroid);
          this.asteroidLayer.addChild(asteroid.container);
        } else if (astRoll < 0.5) {
          // Drifting asteroid
          const asteroidY = newY + gapY * 0.5;
          const asteroidX = Math.random() > 0.5 ? -25 : screenWidth + 25;
          const asteroidVx = (Math.random() > 0.5 ? 1 : -1) * (35 + Math.random() * 50);
          const asteroid = new Asteroid({
            x: asteroidX,
            y: asteroidY,
            vx: asteroidVx,
            behavior: 'DRIFTING',
            radius: 9 + Math.random() * 5
          });
          this.asteroids.push(asteroid);
          this.asteroidLayer.addChild(asteroid.container);
        }
      }
    }
  }

  private cullOffscreenEntities(): void {
    const screenHeight = this.app.screen.height;
    const despawnY = this.cameraY + screenHeight * 1.4;

    // Cull distant planets below screen
    this.planets = this.planets.filter((planet) => {
      if (planet.y > despawnY && !planet.isCurrent) {
        planet.destroy();
        return false;
      }
      return true;
    });

    // Cull distant asteroids
    this.asteroids = this.asteroids.filter((asteroid) => {
      if (asteroid.y > despawnY || asteroid.y < this.cameraY - screenHeight * 2.2) {
        asteroid.destroy();
        return false;
      }
      return true;
    });

    // Cull collected or offscreen pickups
    this.pickups = this.pickups.filter((pickup) => {
      if (pickup.isCollected || pickup.y > despawnY || pickup.y < this.cameraY - screenHeight * 2.2) {
        pickup.destroy();
        return false;
      }
      return true;
    });
  }

  private update(ticker: { deltaTime: number }): void {
    if (this.isPaused) return;

    const dt = Math.min(0.05, (ticker.deltaTime / 60));
    this.totalElapsedTime += dt;

    // 1. Update Multiplier Power-Up Timer (Ticker-driven)
    if (this.isMultiplierActive) {
      this.multiplierRemaining -= dt;
      if (this.multiplierRemaining <= 0) {
        this.multiplierRemaining = 0;
        this.isMultiplierActive = false;
        this.player.isMultiplierActive = false;
      }
      gameEvents.emit(GAME_EVENTS.MULTIPLIER_POWERUP_UPDATE, {
        active: this.isMultiplierActive,
        remaining: Math.max(0, this.multiplierRemaining),
        total: this.MULTIPLIER_DURATION
      });
    }

    // 2. Update Pickups
    for (const pk of this.pickups) {
      pk.update(dt);
      // Check collection
      if (!pk.isCollected && pk.checkCollision(this.player.x, this.player.y, this.player.radius)) {
        this.handlePickupCollection(pk);
      }
    }

    // 3. Update Asteroids
    for (const a of this.asteroids) {
      let planetCoords: { x: number; y: number } | undefined;
      if (a.behavior === 'ORBITING') {
        const p = this.planets.find(pl => pl.id === a.orbitPlanetId);
        if (p) planetCoords = { x: p.x, y: p.y };
      }
      a.update(dt, this.app.screen.width, planetCoords);
    }

    // 4. Update Planets
    for (const p of this.planets) {
      p.update(dt, this.totalElapsedTime);
    }

    // 5. Update Particles
    this.particleManager.update(dt);

    // 6. Chain Warp Sequencing OR Standard Player Update
    if (this.isWarpActive) {
      this.updateWarpSequence(dt);
    } else {
      this.player.update(dt, this.particleManager);
    }

    // 7. Check Collisions & Capture
    if (!this.isWarpActive && this.player.state === 'LAUNCHED') {
      // A. Check Planet Capture
      const capture = this.player.checkCapture(this.planets);
      if (capture) {
        if (capture.planet.type === 'HAZARD') {
          this.triggerGameOver('HAZARD_COLLISION');
        } else {
          this.handleSuccessfulCapture(capture.planet, capture.distance, capture.isPerfect);
        }
      }

      // B. Check Asteroid Collision (Exact circle hitbox)
      for (const asteroid of this.asteroids) {
        if (asteroid.checkCollision(this.player.x, this.player.y, this.player.radius)) {
          this.particleManager.emitAsteroidShatter(asteroid.x, asteroid.y);
          this.triggerGameOver('DEBRIS_COLLISION');
          break;
        }
      }

      // C. Check Hazard Moons on nearby planets
      for (const planet of this.planets) {
        if (planet.checkHazardMoonCollision(this.player.x, this.player.y, this.player.radius)) {
          this.triggerGameOver('DEBRIS_COLLISION');
          break;
        }
      }

      // D. Check Out-of-Bounds Fail
      const screenWidth = this.app.screen.width;
      const screenHeight = this.app.screen.height;
      const outOfBoundsLeft = this.player.x < -60;
      const outOfBoundsRight = this.player.x > screenWidth + 60;
      const outOfBoundsBottom = this.player.y > this.cameraY + screenHeight + 60;
      const outOfBoundsTop = this.player.y < this.cameraY - 450;

      if (outOfBoundsLeft || outOfBoundsRight || outOfBoundsBottom || outOfBoundsTop) {
        this.triggerGameOver('LOST_IN_SPACE');
      }
    } else if (!this.isWarpActive && this.player.state === 'ORBITING' && this.player.currentPlanet) {
      if (this.player.currentPlanet.checkHazardMoonCollision(this.player.x, this.player.y, this.player.radius)) {
        this.triggerGameOver('DEBRIS_COLLISION');
      }
    }

    // 8. Camera Interpolation (Smooth Lerp)
    this.updateCamera(dt);

    // 9. Update Starfield Parallax
    if (this.starfield) {
      this.starfield.update(this.cameraY, dt, this.totalElapsedTime);
    }

    // 10. Procedural Planet Generation & Culling
    if (this.gameState === 'PLAYING') {
      this.generatePlanetsAhead();
      this.cullOffscreenEntities();
    }
  }

  private handlePickupCollection(pickup: Pickup): void {
    pickup.isCollected = true;

    if (pickup.type === 'MULTIPLIER') {
      // 2x Score for 10 seconds
      this.isMultiplierActive = true;
      this.multiplierRemaining = this.MULTIPLIER_DURATION;
      this.player.isMultiplierActive = true;

      SoundManager.playPickup('MULTIPLIER');
      HapticsManager.pickupImpact();
      this.particleManager.emitPickupBurst(pickup.x, pickup.y, 0xdfb15b);

      gameEvents.emit(GAME_EVENTS.MULTIPLIER_POWERUP_UPDATE, {
        active: true,
        remaining: this.MULTIPLIER_DURATION,
        total: this.MULTIPLIER_DURATION
      });

      // Bonus collection score (scaled to 10-point base factor)
      const bonus = 25 * (this.isMultiplierActive ? 2 : 1);
      this.score += bonus;
      this.emitScoreUpdate(false);

    } else if (pickup.type === 'WARP') {
      // Chain Warp Conduit (Auto-jump 5 orbits ahead)
      SoundManager.playPickup('WARP');
      HapticsManager.pickupImpact();
      this.particleManager.emitPickupBurst(pickup.x, pickup.y, 0x89c2d9);

      this.startWarpSequence();
    }
  }

  private startWarpSequence(): void {
    // Generate enough planets ahead to guarantee at least 5 targets
    this.generatePlanetsAhead();

    // Select the next 5 consecutive planets ahead of player's Y position
    const currentPlanetId = this.player.currentPlanet?.id ?? -1;
    const candidates = this.planets
      .filter(p => p.id !== currentPlanetId && p.y < this.player.y - 30 && p.type !== 'HAZARD')
      .sort((a, b) => b.y - a.y); // Closest upward first

    if (candidates.length < 5) {
      // Spawn extra planets
      this.generatePlanetsAhead();
    }

    const available = this.planets
      .filter(p => p.id !== currentPlanetId && p.y < this.player.y - 30 && p.type !== 'HAZARD')
      .sort((a, b) => b.y - a.y);

    this.warpTargetList = available.slice(0, this.WARP_MAX_HOPS);
    if (this.warpTargetList.length === 0) return;

    this.isWarpActive = true;
    this.warpHopCount = 0;
    this.player.isWarping = true;
    this.warpPhase = 'TRAVELING';
    this.warpTargetPlanet = this.warpTargetList[0];

    // Detach from current orbit into straight warp trajectory
    this.player.state = 'LAUNCHED';

    gameEvents.emit(GAME_EVENTS.WARP_SEQUENCE_UPDATE, {
      active: true,
      hop: 0,
      totalHops: this.WARP_MAX_HOPS
    });
  }

  private updateWarpSequence(dt: number): void {
    if (!this.warpTargetPlanet) {
      this.endWarpSequence();
      return;
    }

    if (this.warpPhase === 'TRAVELING') {
      // High-speed guided flight toward target planet
      const dx = this.warpTargetPlanet.x - this.player.x;
      const dy = this.warpTargetPlanet.y - this.player.y;
      const dist = Math.hypot(dx, dy);

      const warpSpeed = 1150; // Rapid transit
      const angle = Math.atan2(dy, dx);
      this.player.vx = Math.cos(angle) * warpSpeed;
      this.player.vy = Math.sin(angle) * warpSpeed;

      this.player.x += this.player.vx * dt;
      this.player.y += this.player.vy * dt;

      // Hyper-speed warp trail
      this.particleManager.emitTrail(this.player.x, this.player.y, 0xe0f2fe, 1.8);

      if (dist <= this.warpTargetPlanet.orbitRadius + 12) {
        // Snap into orbit for brief revolution
        this.player.snapToPlanet(this.warpTargetPlanet, this.warpTargetPlanet.orbitRadius, 1);
        this.warpPhase = 'ORBITING_BRIEFLY';
        this.warpOrbitTimer = 0.28; // ~0.28s quick rotation
        this.warpHopCount++;

        // Bonus score for this warp hop (scaled to 10-point base factor)
        const scoreMult = this.isMultiplierActive ? 2 : 1;
        const hopBonus = 35 * scoreMult;
        this.score += hopBonus;
        this.totalOrbitsCount++;

        if (this.score > this.highScore) {
          this.highScore = this.score;
          StorageManager.setHighScore(this.highScore);
        }

        // Audio, Haptics & Particle burst on hop
        SoundManager.playWarpHop(this.warpHopCount);
        HapticsManager.warpHopImpact(this.warpHopCount);
        this.particleManager.emitCaptureBurst(this.player.x, this.player.y, 0xe0f2fe, 26);

        this.emitScoreUpdate(true);
        gameEvents.emit(GAME_EVENTS.WARP_SEQUENCE_UPDATE, {
          active: true,
          hop: this.warpHopCount,
          totalHops: this.WARP_MAX_HOPS
        });
      }
    } else if (this.warpPhase === 'ORBITING_BRIEFLY') {
      // Rotate around planet smoothly at high speed
      this.player.update(dt, this.particleManager);
      this.warpOrbitTimer -= dt;

      if (this.warpOrbitTimer <= 0) {
        if (this.warpHopCount >= this.WARP_MAX_HOPS) {
          // Finished all 5 hops! Hand back full control to player in orbit
          this.endWarpSequence();
        } else {
          // Launch to next planet in target list
          const nextTarget = this.warpTargetList[this.warpHopCount];
          if (nextTarget) {
            this.warpTargetPlanet = nextTarget;
            this.player.launch();
            this.warpPhase = 'TRAVELING';
          } else {
            this.endWarpSequence();
          }
        }
      }
    }
  }

  private endWarpSequence(): void {
    this.isWarpActive = false;
    this.player.isWarping = false;
    this.warpTargetPlanet = null;
    this.warpTargetList = [];

    gameEvents.emit(GAME_EVENTS.WARP_SEQUENCE_UPDATE, {
      active: false,
      hop: this.WARP_MAX_HOPS,
      totalHops: this.WARP_MAX_HOPS
    });
  }

  private handleSuccessfulCapture(planet: Planet, distance: number, isPerfect: boolean): void {
    const dx = this.player.x - planet.x;
    const dy = this.player.y - planet.y;
    const cross = dx * this.player.vy - dy * this.player.vx;
    const dir: 1 | -1 = cross >= 0 ? 1 : -1;

    // Snap to orbit
    this.player.snapToPlanet(planet, distance, dir);

    // Combo streak management
    this.combo++;
    this.totalOrbitsCount++;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    const multiplier = Math.min(10, 1 + Math.floor(this.combo / 2));
    let basePoints = 10;

    if (planet.type === 'BOOST') {
      basePoints += 5;
      SoundManager.playBonus();
    }

    if (isPerfect) {
      basePoints += 15;
      SoundManager.playPerfect();
      HapticsManager.perfectImpact();
      gameEvents.emit(GAME_EVENTS.PERFECT_CAPTURE, { planet, combo: this.combo });
    } else {
      SoundManager.playCapture(this.combo);
      HapticsManager.captureImpact();
    }

    // Apply active 2x Power-Up Multiplier if active
    const powerupFactor = this.isMultiplierActive ? 2 : 1;
    const earnedScore = basePoints * multiplier * powerupFactor;
    this.score += earnedScore;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      StorageManager.setHighScore(this.highScore);
    }

    // Visual burst effect
    this.particleManager.emitCaptureBurst(this.player.x, this.player.y, planet.getColor(), isPerfect ? 36 : 22);

    // Notify UI
    this.emitScoreUpdate(isPerfect);
  }

  private emitScoreUpdate(isPerfect: boolean): void {
    const multiplier = Math.min(10, 1 + Math.floor(this.combo / 2));
    const altitude = Math.max(0, Math.floor(-this.highestPlanetY / 10));

    gameEvents.emit(GAME_EVENTS.SCORE_UPDATE, {
      score: this.score,
      combo: this.combo,
      multiplier,
      altitude,
      isPerfect
    });
  }

  private triggerGameOver(reason: 'LOST_IN_SPACE' | 'HAZARD_COLLISION' | 'DEBRIS_COLLISION'): void {
    if (this.gameState === 'GAMEOVER') return;
    this.isPaused = false;
    this.isWarpActive = false;
    this.isMultiplierActive = false;

    this.player.kill();
    this.setGameState('GAMEOVER');

    // Explosive particles & shockwaves at death point
    this.particleManager.emitCrashExplosion(this.player.x, this.player.y);

    // Audio & Haptics
    SoundManager.playCrash();
    HapticsManager.crashImpact();

    // Trigger Screen Shake
    this.screenShakeTime = 0.45;
    this.screenShakeMagnitude = 18;

    // Check high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      StorageManager.setHighScore(this.highScore);
    }

    // Emit Game Over Event
    gameEvents.emit(GAME_EVENTS.GAME_OVER, {
      score: this.score,
      highScore: this.highScore,
      orbitsCount: this.totalOrbitsCount,
      maxCombo: this.maxCombo,
      reason
    });
  }

  private updateCamera(dt: number): void {
    const screenHeight = this.app.screen.height;

    let focusY = this.player.y;
    if (this.player.state === 'ORBITING' && this.player.currentPlanet) {
      focusY = this.player.currentPlanet.y;
    }

    // Keep active planet/player at ~50% in MENU, ~65% in PLAYING
    const screenPercent = this.gameState === 'MENU' ? 0.5 : 0.65;
    this.targetCameraY = focusY - screenHeight * screenPercent;

    // Smooth camera interpolation (lerp) - faster during warp
    const lerpSpeed = (this.isWarpActive ? 12 : 7) * dt;
    this.cameraY += (this.targetCameraY - this.cameraY) * Math.min(1, lerpSpeed);

    // Screen Shake effect
    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
      const mag = this.screenShakeMagnitude * (this.screenShakeTime / 0.45);
      shakeX = (Math.random() - 0.5) * mag * 2;
      shakeY = (Math.random() - 0.5) * mag * 2;
    }

    // Apply camera transform to game world
    this.worldContainer.position.x = shakeX;
    this.worldContainer.position.y = -this.cameraY + shakeY;
  }

  public resize(width: number, height: number): void {
    if (!this.app.renderer) return;

    this.app.renderer.resize(width, height);
    if (this.starfield) {
      this.starfield.resize(width, height);
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.isPaused = false;
    this.isWarpActive = false;
    this.isMultiplierActive = false;

    try {
      if (this.app?.ticker) {
        this.app.ticker.remove(this.update, this);
      }
    } catch {
      // ignore
    }

    try {
      this.starfield?.destroy();
    } catch {
      // ignore
    }

    try {
      this.particleManager?.destroy();
    } catch {
      // ignore
    }

    try {
      this.player?.destroy();
    } catch {
      // ignore
    }

    for (const p of this.planets) {
      try {
        p.destroy();
      } catch {
        // ignore
      }
    }
    this.planets = [];

    for (const a of this.asteroids) {
      try {
        a.destroy();
      } catch {
        // ignore
      }
    }
    this.asteroids = [];

    for (const pk of this.pickups) {
      try {
        pk.destroy();
      } catch {
        // ignore
      }
    }
    this.pickups = [];

    try {
      this.worldContainer?.destroy({ children: true });
    } catch {
      // ignore
    }

    try {
      if (this.app?.renderer) {
        this.app.destroy(true, { children: true });
      }
    } catch {
      // ignore
    }
  }
}
