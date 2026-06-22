# Orientation Guide - Retro Asteroids Clone

## Introduction
Welcome to the Retro Asteroids Clone! This repository contains a complete, highly-optimized recreation of the classic 1979 arcade game *Asteroids*. It is implemented inside a modern web stack using a high-performance HTML5 Canvas and strict TypeScript.

The codebase features a custom 2D physics engine, precise bounding circle collisions, endless wave progression, and is fully covered by a robust, co-located unit test suite.

---

## Tech Stack
Our development stack is selected for strictness, performance, and ultra-fast iteration loops:
- **Programming Language**: TypeScript (strict mode enabled)
- **Application Bundler & Dev Server**: [Vite](https://vitejs.dev/) (fast HMR, lightweight asset compiling)
- **Testing Runner & Framework**: [Vitest](https://vitest.dev/) (blazing-fast unit and integration test runner)
- **Style Engine**: Clean, minimal retro CSS centered layouts

---

## Core Features
The gameplay perfectly simulates the original arcade's momentum and mechanics:
1. **Inertial Physics & Drag**: The ship features momentum-based drift. Thrusting adds velocity in the direction of the ship's nose, and releasing thrust applies continuous, deltaTime-adjusted exponential drag (friction).
2. **Screen Wrapping**: Seamless coordinates wrapping on all physical boundaries. Any entity (Ship, Asteroid, or Bullet) drifting off one edge of the canvas instantly wraps back on the opposite side.
3. **Hyperspace Panic Action**: Instant random-coordinate safety teleportation by pressing the `S` key. This features safe positioning checks, clears momentum, and grants immediate temporary invulnerability.
4. **Projectile Limits**: To keep gameplay authentic and fair, players can have a maximum of 6 active bullets on screen at any time. Fired bullets decay automatically and deactivate after a 1.2-second lifetime.
5. **Jagged Asteroid Splits**: Asteroids are pre-generated as irregular 10-vertex jagged circular shapes that do not flicker. They come in three sizes (Large, Medium, Small) with corresponding point awards. Destroying larger asteroids splits them into two faster child fragments, while small asteroids vanish entirely upon being shot.
6. **Endless Wave Progression**: Clear waves to spawn larger numbers of fast-moving asteroids. Each transition has a 2.5-second buffer delay displaying a "WAVE CLEAR!" text animation before spawning the new wave safe-distance checked from the ship.
7. **Monochrome Vector Visuals**: Uses high-contrast white vector outline styles with subtle neon glows over pitch-black backgrounds, capturing the 1979 classic cathode-ray vector display look.

---

## Codebase Structure
The project is modularized into dedicated components, entities, and math layers:
```
src/
├── main.ts              # Entrypoint, canvas setup, animation loop (requestAnimationFrame)
├── game.ts              # Core Game manager, key event listeners, state machine & collision loop
├── styles.css           # Global typography & layout styling (neon vector theme)
├── entities/            # Physical objects with custom logic & drawing routines
│   ├── ship.ts          # Ship movement, rotational math, flashing & thruster drawing
│   ├── bullet.ts        # Bullet coordinates update, lifetime decay, and drawing
│   └── asteroid.ts      # Asteroid generation, size characteristics, and wave safe-spawning
└── utils/               # Pure mathematical & physics helper routines
    ├── physics.ts       # DeltaTime vector additions, exponential drag, and screen wrapping
    └── collision.ts     # Squared-distance circle-to-circle and point-to-circle intersections
```

---

## Entry Point Instructions for AI Agents & Developers
When onboarding or performing new development iterations on this repository, please adhere to the following sequence to preserve alignment:
1. **Orientation**: Read this guide (`agent_docs/01_orientation/README.md`) to understand the system dependencies, coordinate conventions, and module structure.
2. **Patterns**: Inspect standard implementation conventions under `agent_docs/02_patterns/`:
   - [Rendering and Physics Standards](../02_patterns/rendering_and_physics_standards.md): For vector mathematics, exponential friction factors, and screen wrapping constraints.
   - [Testing Standards](../02_patterns/testing_standards.md): For Vitest patterns, co-located tests, and the 100% test coverage expectation.
3. **Deep Dives**: Consult architecture analyses under `agent_docs/03_deep_dives/` for intricate subsystem knowledge:
   - [Game Loop and State Machine](../03_deep_dives/game_architecture_and_state.md): To understand the central game engine loop, delta-time limit caps, and state transitions.
   - [Entities and Collision Systems](../03_deep_dives/entities_and_collision_system.md): To map class relationships and learn squared distance calculation optimizations.
4. **Plans**: Before writing code, propose, design, and obtain alignment on a comprehensive plan under `agent_docs/04_plans/`. Update step-by-step checklists in real-time as tasks are completed.
