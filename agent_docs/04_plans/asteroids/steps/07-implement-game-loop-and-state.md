# Step 7: Implement Game Loop and State

## Goal
Establish full game state management, wave transitions, on-screen text/score rendering, and a Main Menu/Start screen. "Done" means the user can load the page, press a key to start, play the game, watch their score update, and transition to increasingly challenging waves of asteroids after clearing the screen.

## Context
This is the final step that wraps all developed entities and utilities into a complete, polished arcade experience. It manages high-level states (Menu vs. Active Game), score displays, and automatic progression of asteroid waves.

## Files to Edit/Create
- `src/game.ts` (Create)
- `src/main.ts` (Edit)

## Proposed Logic & Implementation Details
1. **Game State Structure (`src/game.ts`)**:
   - Create a clean `GameState` class or state manager representing:
     - `score`: number
     - `wave`: number
     - `state`: 'MENU' | 'PLAYING'
     - `waveTransitionTimer`: number (seconds, e.g., 2.5s)
     - `asteroids`: Asteroid[]
     - `bullets`: Bullet[]
   - This state should be shared or managed inside the main game loop.
2. **Main Menu Screen**:
   - Draw a beautiful retro vectors title: "ASTEROIDS".
   - Render "PRESS ENTER TO START" or "PRESS ANY KEY TO START".
   - Use simple canvas drawing with `fillText`, specifying a monospaced font family (like `Courier New` or a Google Font like `Press Start 2P` loaded in HTML).
3. **Score & Wave Interface Display**:
   - Draw the score in the top-left (e.g., `SCORE: 00250`).
   - Draw the current wave in the top-right (e.g., `WAVE 1`).
4. **Wave Transitions**:
   - If the active `asteroids.length === 0`:
     - Run a transition delay timer (`waveTransitionTimer -= deltaTime`).
     - Once the timer hits 0:
       - Increment `wave`.
       - Spawn a new wave of large asteroids (e.g., count = `4 + wave` or similar formula).
       - Reset the transition timer.
5. **Vite Build & Assets Packing**:
   - Verify that all imports are correct and TypeScript compiles cleanly: `npm run build`.
   - Ensure the static output in `dist/` contains everything required to run on a standalone CDN.

## Verification & Tests
1. Start development server.
2. Verify that on first load:
   - A black "ASTEROIDS" start screen appears.
   - Pressing Enter (or designated key) starts the active game.
3. Test a full round of gameplay:
   - Destroy all starting asteroids.
   - Verify that once the last asteroid is destroyed, there is a 2-3 second delay where the game continues updating.
   - After the delay, a new wave spawns with more asteroids, and the wave indicator increases.
4. Run `npm run build` to verify the project builds without compile or type errors.
