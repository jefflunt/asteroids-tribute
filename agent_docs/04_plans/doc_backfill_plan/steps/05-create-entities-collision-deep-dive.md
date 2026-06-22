# Step 5: Create Entities & Collision System Deep Dive

## Goal
Create `agent_docs/03_deep_dives/entities_and_collision_system.md` to map out the entity-relationship hierarchy and physics collision math, matching the `deep_dive_template.md` format.

## Details
1. **Overview**: Outline of the physical game entities and their intersection detectors.
2. **Purpose**: Document how `Ship`, `Bullet`, and `Asteroid` classes interact, divide, and check overlaps.
3. **Components**:
   - **Ship Entity (`src/entities/ship.ts`)**: Rotational physics, forward momentum thrusting, shooting mechanics (nose position firing), invulnerability flashing (3.0s window), and hyperspace random teleportation safety.
   - **Bullet Entity (`src/entities/bullet.ts`)**: Speed constants, range limits, on-screen bullets capacity (capped at 6), and active lifetime expiration.
   - **Asteroid Entity (`src/entities/asteroid.ts`)**: Large/Medium/Small size values, irregular 10-vertex jagged drawing coordinates to avoid flickering, score weight allocations (50, 75, 100), splitting behavior, and the safe-spawning distance solver (at least 150px away from the center).
   - **Collision Utilities (`src/utils/collision.ts`)**: Circle-circle overlaps (using squared distance math to bypass costly square-root calculations) and point-circle overlays.
4. **Data Flow**:
   - Spawning waves -> updating positions based on acceleration/friction -> calculating collisions on every frame -> bullet hits splitting or destroying asteroids -> asteroid-ship hits triggering resets.
5. **Concerns & Constraints**: Bounding circle collision vs irregular jagged rendering; performance advantages of using squared distances instead of calling `Math.sqrt` frequently inside nested collision loops.

## Checklist
- [ ] Create the deep-dive file `entities_and_collision_system.md` under `agent_docs/03_deep_dives/`.
- [ ] Ensure that it adheres perfectly to the structure in `templates/deep_dive_template.md`.
- [ ] Confirm file links are intact and documentation is highly informative.
