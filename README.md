# Retro Asteroids Clone 🚀

A polished, single-player, browser-based **Asteroids clone** built from scratch with **TypeScript** and **HTML5 Canvas 2D Context**, powered by **Vite** tooling. The game features realistic inertial physics, screen boundary wrapping, irregular pre-generated jagged vector aesthetics, scoring, infinite-lives wave progression, and comprehensive unit tests.

---

## 🎮 Game Controls

The game is controlled using a custom **WASD + Spacebar** keyboard scheme, engineered with custom prevention of default browser scrolling actions:

*   **`W`** - **Thrust / Accelerate**: Fires the rocket boosters. Applies continuous forward force in the direction the ship is facing. Releasing it allows the ship to glide gracefully under classic inertial drift (friction/drag).
*   **`A`** - **Rotate Left**: Rotates the ship counter-clockwise.
*   **`D`** - **Rotate Right**: Rotates the ship clockwise.
*   **`S`** - **Hyperspace Jump**: Panic-button teleportation! Instantly teleports the ship to a completely random location on the screen and zeroes out its velocity to avoid immediate collision hazards. Grants a short safety window of invulnerability.
*   **`Spacebar`** - **Shoot**: Fires a fast-moving projectile from the tip of the ship. Holds a strict **6-bullet on-screen limit** simultaneously to encourage tactical aiming.

---

## 🚀 How to Run, Build, and Test

### 📋 Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your system.

### 🔧 Installation
First, clone the repository and install the development dependencies:
```bash
npm install
```

### 🏃‍♂️ Running for Development
Modern web browsers block ES module imports on files loaded directly via the `file://` protocol due to CORS security policies. Therefore, the game must be served through a local development server.

To start the local Vite development server with hot module reloading:
```bash
npm run dev
```
Once started, open your browser and navigate to the printed local address (typically `http://localhost:5173`).

### 📦 Building for Production
To compile and bundle the application into highly optimized, minified static HTML, CSS, and JS assets inside the `dist/` folder:
```bash
npm run build
```

### 🌐 Previewing the Production Build
To test and preview the production build locally before uploading to a static host or CDN:
```bash
npm run preview
```
Navigate to the printed local address (typically `http://localhost:4173`) to test the built bundle.

### 🧪 Running the Test Suite
The project utilizes **Vitest** for robust and fast unit testing. To run the full test suite (consisting of **36 unit and integration tests** covering all physics, entities, state, and collisions):
```bash
npm run test
```

---

## 🏗️ Architecture Overview

The game is modularly structured to keep logic decoupled, maintainable, and highly testable:

```
asteroids/
├── index.html                   # HTML entry point with <canvas> container
├── package.json                 # Project dependencies & npm scripts
├── tsconfig.json                # TypeScript compiler configuration
├── README.md                    # Documentation & guide (this file)
├── src/
│   ├── main.ts                  # Canvas initiation & frame-independent animation gameLoop
│   ├── game.ts                  # Central GameState manager & collision resolver
│   ├── styles.css               # Styling layout, centering canvas, and glowing shadow effects
│   ├── entities/
│   │   ├── ship.ts              # Player ship (rotational thrust, hyperspace, flame, & flashes)
│   │   ├── bullet.ts            # Projectile weapon (6-bullet threshold, travel lifetime)
│   │   └── asteroid.ts          # Pre-generated jagged outline asteroids & splitting logic
│   └── utils/
│       ├── physics.ts           # Screen boundary wrapping, drag, & velocity clamps
│       └── collision.ts         # Circle-circle & circle-point collision detectors
```

### Key Subsystems:
1.  **Frame-Independent Loop (`src/main.ts`)**: Runs on browser `requestAnimationFrame`. Computes `deltaTime` scaled in seconds, capped at `0.1s` to prevent massive leaps on window tab-switching, ensuring smooth physics independent of monitor refresh rates.
2.  **Central Game State Manager (`src/game.ts`)**: Directs keyboard listeners, controls game states (`MENU` vs. `PLAYING`), tracks score points (+50 for large, +75 for medium, +100 for small), increments waves of asteroids, and handles collisions.
3.  **Entity System (`src/entities/`)**:
    *   **`Ship`**: Handles directional thrust vectors, rotates at `4 rad/s`, clamps speeds at `300 px/s`, and features a `3.0s` invulnerability safety window on respawns.
    *   **`Bullet`**: Spawns precisely at the nose tip of the ship, moves at `500 px/s`, and dissolves after `1.2` seconds.
    *   **`Asteroid`**: Generates 10 vertices with random radial offsets inside constructor to construct a permanent unique jagged shape without visual flickering. Splits into two medium pieces when large, two small pieces when medium, and fully dissolves when small. Spawns new wave pieces at least `150px` away from the ship to avoid instant spawn-kills.
4.  **Physics Utilities (`src/utils/physics.ts`)**: Pure utility functions determining wrapping, exponential drag decay (`dragFactor = 0.985`), and vector math calculations.
5.  **Collision Engine (`src/utils/collision.ts`)**: Fast distance squared circle overlaps checking to preserve optimal 60 FPS performance.
