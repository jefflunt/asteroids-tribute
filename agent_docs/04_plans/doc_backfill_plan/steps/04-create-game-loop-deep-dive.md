# Step 4: Create Game Loop & State Deep Dive

## Goal
Create `agent_docs/03_deep_dives/game_architecture_and_state.md` to analyze the main game state machine and animation loop, matching the `deep_dive_template.md` format.

## Details
1. **Overview**: Outline of the Game state manager (`src/game.ts`) and main browser loop (`src/main.ts`).
2. **Purpose**: Deep explanation of the orchestrator layer that ties the main canvas drawing context, inputs, and state updates together.
3. **Components**:
   - **Vite/main loop**: Capturing performance clock, capping maximum delta-time jumps (at `0.1s`), and recursively invoking `requestAnimationFrame`.
   - **Game Manager**: Handles GameState configurations (`'MENU'` | `'PLAYING'`).
   - **Input Hook Listeners**: Maps keyboard arrow controls, S (Hyperspace), W (Thrust), A/D (Rotate), and Enter (State transitions) safely, preventing default page scrolling.
   - **UI Rendering Overlays**: Details score formatting (with retro padding e.g. `00150`), wave transitions (delay timing), flashing text effects, and alignment overlays.
4. **Data Flow**: Step-by-step description of a single frame update:
   - Calculating frame time delta -> passing to `game.update(deltaTime)` -> fetching inputs -> updating entity velocities -> checking collisions -> rendering to canvas.
5. **Concerns & Constraints**: Explain the cap on `deltaTime` (to prevent massive physics teleportation when switching tabs) and avoiding double bullet-hit triggers in single frames.

## Checklist
- [ ] Create the directory `agent_docs/03_deep_dives/` if it does not exist.
- [ ] Create the deep-dive file `game_architecture_and_state.md` under `agent_docs/03_deep_dives/`.
- [ ] Check alignment with `templates/deep_dive_template.md`.
- [ ] Validate relative file path references.
