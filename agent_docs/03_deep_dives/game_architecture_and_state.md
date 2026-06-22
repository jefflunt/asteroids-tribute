# Deep Dive: Game Loop & State

## Overview
The Retro Asteroids Clone core orchestration resides in two foundational files:
1. `src/main.ts`: The bootstrap layer that manages the browser-native animation ticking and computes frame-by-frame delta times.
2. `src/game.ts`: The central state coordinator and gameplay manager that houses the entity collection, handles user inputs, executes collision routines, and triggers drawing contexts.

---

## Purpose
The primary purpose of this subsystem is to act as the central "nervous system" of the game. It bridges the low-level browser rendering capabilities with the high-level game logic. It ensures that inputs are gathered cleanly without disrupting browser defaults, state changes (like menu to active gameplay) are handled gracefully, physics updates are applied uniformly using independent timers, and visual overlays are drawn accurately based on the active state.

---

## Components

### 1. Browser Loop & Timesteps (`src/main.ts`)
The application is driven by a `requestAnimationFrame` loop, which synchronizes updates with the monitor's vertical blanking interval (Vsync). Key responsibilities include:
- **Width/Height Initialization**: Configures a fixed coordinates space of `800x600` on the HTML5 Canvas, providing a predictable viewport regardless of screen size.
- **Delta-Time Computation**: Measures the time elapsed since the last frame (in seconds) by comparing `performance.now()` values.
- **Delta-Time Protection Cap**: If `deltaTime` is greater than `0.1s` (e.g., when the user switches browser tabs or minimizes the window), it is strictly capped at `0.1`. This prevents entities from teleporting across the screen or tunneling through collision boundaries upon returning.

### 2. State Machine (`src/game.ts`)
The central `Game` class manages state progression using the `GameState` union type:
- `MENU`: Shows a retro glowing wireframe title, control prompt ("PRESS ENTER TO START" flashing every 500ms), and lists player controls.
- `PLAYING`: Enables active simulation loops. Inputs control the ship, bullet objects are updated, asteroids split, and scores accumulate.

```typescript
export type GameState = 'MENU' | 'PLAYING';
```

### 3. Keyboard Input Hook Listener
Binds event listeners for `keydown` and `keyup` to the browser's `window` object. It includes:
- **Default Action Suppression**: Calls `e.preventDefault()` on keys like `W`, `A`, `S`, `D`, `ArrowKeys`, `Spacebar`, and `Enter` to prevent default page scrolling or jumping during intense gameplay.
- **Input Filtering**: Keeps track of held keys via a `keysPressed` map. Distinguishes between continuous actions (like holding `W` to thrust, or `A`/`D` to turn) and single-trigger actions (like pressing `Spacebar` to shoot, or `S` to activate Hyperspace, which cannot be held down to spam).

### 4. UI Rendering Overlays
During gameplay, the manager renders vital UI stats:
- **Score Formatting**: Formats the numeric score with padded retro zeros (e.g., `SCORE: 00150`) positioned in the top-left corner.
- **Wave Transition Buffers**: If all asteroids are cleared, a `waveTransitionActive` flag triggers a `2.5`-second countdown. It renders a centered "WAVE CLEAR!" announcement and suspends physics until spawning the next wave.

---

## Data Flow
Each tick of the browser loop triggers a sequence of data translations across the main loop and game coordinator:

```
[Browser Frame Event]
         │
         ▼
1. Calculate delta-time (performance.now())
         │
         ▼
2. Cap delta-time at 0.1s (main.ts)
         │
         ▼
3. Call game.update(deltaTime) (game.ts)
         ├── a) Read inputs (keysPressed) -> update ship velocity & rotation
         ├── b) Update entities (Ship, Bullets, Asteroids) -> apply movement & drag
         ├── c) Run checkCollisions() -> handle splits, scoring, & ship resets
         └── d) If asteroids empty -> decrease waveTransitionTimer -> spawn new wave
         │
         ▼
4. Call game.draw(ctx) (game.ts)
         ├── a) Clear Canvas to black
         ├── b) If MENU -> draw title overlays & flashing prompt
         └── c) If PLAYING -> draw entities & UI stat overlays
```

---

## Concerns & Constraints

### 1. Frame Rate Fluctuations
Since the game loop runs on `requestAnimationFrame`, hardware spikes or background tab throttling could result in massive `deltaTime` values. Without the `0.1s` cap implemented in `main.ts`, a large timestep would multiply physical velocities, causing entities to leap across the viewport in a single tick and bypass collision detection entirely (collision tunneling).

### 2. Double-Collision Triggers
In a single frame, a bullet might overlap with multiple closely-clustered asteroids, or a single bullet could register multiple hits before being removed from the bullet list. To prevent scoring glitches and redundant splits, the collision loop is processed in reverse order (`for (let b = bullets.length - 1; b >= 0; b--)`). Once a hit is registered, the bullet is immediately deactivated/spliced, and the loop breaks to the next bullet, eliminating double-trigger bugs.

### 3. Input Key Ghosting
Continuous event firing from holding keys (like `Spacebar`) could result in bullets spawning on every single frame. To prevent this, the input listener uses the `keysPressed` state map. Projectiles only fire if `Spacebar` is pressed while `keysPressed[' ']` is not yet set, guaranteeing that the player must release and tap the spacebar for each individual bullet fired.
