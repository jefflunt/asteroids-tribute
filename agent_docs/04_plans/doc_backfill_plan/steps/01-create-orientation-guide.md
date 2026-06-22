# Step 1: Create Orientation Guide

## Goal
Scaffold the foundational Orientation Guide under `agent_docs/01_orientation/README.md` to establish project entry context for humans and AI agents.

## Details
Write a markdown file that summarizes:
1. **Introduction**: Classic Retro Asteroids Game implemented in HTML5 Canvas and TypeScript.
2. **Tech Stack**:
   - Language: TypeScript (strict mode enabled).
   - Tooling & Build System: Vite.
   - Testing Framework: Vitest.
3. **Core Features**:
   - Screen-wrapping on all entity coordinates.
   - Inertial ship movement using 2D physics and drag.
   - Spacebar shooting with an on-screen limit of 6 bullets.
   - 3 sizes of irregular jagged asteroids with division mechanics.
   - High-contrast monochromatic wireframe visual style.
   - Endless waves with delay transitions, high scores board, and a panic Hyperspace button.
4. **Codebase Structure**:
   - `src/main.ts`: Application entry and requestAnimationFrame loop.
   - `src/game.ts`: Central Game coordinator, state manager, and input listener.
   - `src/entities/`: Base classes for `Ship`, `Bullet`, and `Asteroid`.
   - `src/utils/`: Physics math (`wrapPosition`, `applyDrag`, `limitSpeed`) and collision detection helpers.
5. **Entry Point Instructions**:
   - Directives instructing future agents to read `agent_docs/01_orientation/README.md` on entry, then move through `agent_docs/02_patterns/` and `agent_docs/03_deep_dives/`.

## Checklist
- [ ] Create the directory `agent_docs/01_orientation/` if it does not exist.
- [ ] Write the comprehensive `README.md` following the details above.
- [ ] Verify formatting and validate that all relative links work correctly.
