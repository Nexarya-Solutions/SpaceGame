# Endless Orbit 🚀🌌

An offline 2D arcade game built with **React**, **Pixi.js v8**, **TypeScript**, and **Capacitor for Android**.

![Dark Neon Sci-Fi Arcade](https://img.shields.io/badge/Style-Neon%20Vector%20Sci--Fi-00f2fe?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![Pixi.js v8](https://img.shields.io/badge/Pixi.js-v8-e72264?style=for-the-badge)
![Capacitor 7](https://img.shields.io/badge/Capacitor-Android%20v7-119eff?style=for-the-badge&logo=capacitor)

---

## 🎮 Core Gameplay Mechanics

- **Orbital Anchor Points:** The player is a glowing spacecraft locked into orbit around celestial anchor planets, rotating with smooth angular velocity ($\omega$).
- **Tangential Launch:** Tapping the screen or pressing `Space` releases the dot along its exact tangential velocity vector $\vec{v} = v \cdot (-\sin\theta, \cos\theta)$ into deep space.
- **Dynamic Orbital Capture:** When the player reaches an adjacent planet's gravitational capture radius:
  - 2D Cross Product calculation ($\vec{r} \times \vec{v} = r_x v_y - r_y v_x$) dynamically sets the orbit direction (Clockwise or Counter-Clockwise) matching the physical angle of incidence.
  - **"Perfect Orbit" Bonus:** Aligning with the ideal orbit boundary triggers special harmonic chimes, burst shockwaves, and combo multipliers!
- **Hazard System & Obstacles:**
  - **Red Dwarf Hazard Stars:** Highly lethal celestial bodies that crush the spacecraft upon gravitational capture.
  - **Moving Planets:** Oscillating horizontal planets that test timing.
  - **Pulsing Capture Rings:** Rhythmically expanding and contracting fields.
  - **Boost Catapults:** High-speed golden planets that accelerate orbit and launch speeds.
  - **Orbiting Hazard Moons & Cosmic Debris:** Lethal satellites rotating around celestial bodies and drifting space rocks.
- **Camera & World:**
  - Viewport camera smoothly lerps upward tracking the player.
  - Infinite procedural generation upward with automatic off-screen entity culling.
  - 3-tier deep space parallax starfield with dynamic twinkling stars.

---

## 🏗️ Architecture & Clean Separation of Concerns

```
src/
├── game/
│   ├── GameApp.ts              # Pixi.js Application, camera lerp, procedural generator, ticker loop
│   ├── entities/
│   │   ├── Player.ts           # Spacecraft state machine (ORBITING, LAUNCHED, DEAD), tangent physics
│   │   ├── Planet.ts           # Celestial bodies (Normal, Moving, Hazard, Pulsing, Boost) + Hazard Moons
│   │   ├── ParticleManager.ts  # High-performance pooled particle bursts, shockwaves, neon trails
│   │   ├── Starfield.ts        # 3-layer parallax starfield with wrapped infinite scrolling
│   │   └── Asteroid.ts         # Procedural drifting space rocks / debris with collision detection
│   ├── audio/
│   │   └── SoundManager.ts     # 100% offline procedural Web Audio synthesizer (melodic combo scales, sweeps, explosions)
│   ├── services/
│   │   ├── HapticsManager.ts   # @capacitor/haptics tactile feedback (Light, Medium, Heavy)
│   │   └── StorageManager.ts   # @capacitor/preferences & localStorage persistence
│   └── events/
│       └── GameEvents.ts       # Typed pub/sub event bus decoupling Pixi ticker from React UI
├── components/
│   ├── GameCanvas.tsx          # React wrapper with ResizeObserver and touch/keyboard input bindings
│   └── GameUI.tsx              # Neon HUD overlay: score, combo streak, altitude, Game Over modal, toggles
├── App.tsx                     # Top-level composition
├── index.css                   # Tailwind CSS styling and neon animations
└── main.tsx                    # Entry point
```

- **Pixi.js Game Loop:** 100% of game loop state, physics, rendering, particles, and camera lerp run in `PIXI.Ticker` without React re-renders.
- **React UI Overlay:** React is purely mounted as an ultra-fast HUD and Modal overlay communicating via `GameEvents`.
- **Procedural Web Audio:** Zero external asset download dependencies; offline sounds synthesized using the Web Audio API (sine sweeps, pentatonic harmonic chimes, explosive filtered noise).

---

## 🚀 Getting Started

### 1. Development Mode
```bash
npm install
npm run dev
```

### 2. Production Build
```bash
npm run build
```

### 3. Capacitor Android Deployment
The native Android project is configured in `android/` with:
- Portrait orientation lock (`android:screenOrientation="portrait"`).
- Hardware acceleration enabled (`android:hardwareAccelerated="true"`).
- Vibration permissions for `@capacitor/haptics`.
- Full-screen immersive display.

To sync web assets with Android and launch in Android Studio:
```bash
# Sync web build to native Android assets
npm run cap:sync

# Open project in Android Studio
npm run cap:android
```
Alternatively, build the APK directly via Gradle:
```bash
cd android
./gradlew assembleDebug
```
The APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

