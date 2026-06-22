# Step 6: Implement Collision Detection

## Goal
Implement collision detection between asteroids and other entities (bullets and ship). "Done" means bullets collide with and split asteroids (scoring points), and the ship collides with asteroids (triggering a safe ship reset/respawn at the center).

## Context
Collision detection brings the core game loop together. By treating all entities as circles for collision calculations (circle-circle for Ship/Asteroid, circle-point/circle-circle for Bullet/Asteroid), we keep computation fast and accurate enough for classic gameplay.

## Files to Edit/Create
- `src/utils/collision.ts` (Create)
- `src/main.ts` (Edit)

## Proposed Logic & Implementation Details
1. **Collision Helpers (`src/utils/collision.ts`)**:
   - Write a function `checkCircleCollision(p1: Vector2D, r1: number, p2: Vector2D, r2: number): boolean`:
     - Calculate distance: `dx = p2.x - p1.x`, `dy = p2.y - p1.y`.
     - Distance squared: `distSq = dx * dx + dy * dy`.
     - Sum of radii squared: `radiiSumSq = (r1 + r2) * (r1 + r2)`.
     - Return `distSq < radiiSumSq`.
   - Write a function `checkPointCircleCollision(point: Vector2D, circleCenter: Vector2D, radius: number): boolean`:
     - Calculate distance squared: `dx = point.x - circleCenter.x`, `dy = point.y - circleCenter.y`.
     - Return `(dx * dx + dy * dy) < (radius * radius)`. (Can also reuse `checkCircleCollision` with radius `0` or `1.5` for bullets).
2. **Integrating Collision Checks in Game Loop (`src/main.ts`)**:
   - **Bullet-Asteroid Collisions**:
     - For each bullet and each asteroid:
       - Check if bullet collides with asteroid using `checkCircleCollision` (using bullet radius 1.5).
       - If a collision occurs:
         - Set bullet active = false.
         - Call `asteroid.split()` and add any returned smaller asteroids to the active asteroids array.
         - Increment player's score according to the asteroid size (+50, +75, or +100).
         - Break early to prevent double-splitting the same asteroid in the same frame.
   - **Ship-Asteroid Collisions**:
     - Check if ship is in invulnerability/safe window (e.g., first 3 seconds of spawn). If yes, skip check.
     - For each asteroid:
       - Check if ship collides with asteroid.
       - If a collision occurs:
         - Trigger ship destruction (reset position to center, clear ship velocity, and start a 3-second invulnerability/safe window).
         - (Optional) Render a simple explosion or screen shake effect, or just let the ship immediately re-center.
3. **Safety Window**:
   - When the ship resets/respawns at the center, set `isInvulnerable = true` and `invulnerableTimeRemaining = 3.0` seconds.
   - During invulnerability, flash the ship (draw every alternate frame) to visually communicate safety.

## Verification & Tests
1. Start development server.
2. Fly the ship directly into an asteroid. Verify:
   - The ship is hit, instantly resets to the screen center, and flashes for 3 seconds.
   - While flashing/invulnerable, hitting asteroids does not trigger further resets.
3. Aim at an asteroid and shoot. Verify:
   - Hitting a Big asteroid splits it into 2 Mediums, and the bullet disappears.
   - Hitting a Medium splits it into 2 Small/Tinies.
   - Hitting a Small/Tiny destroys it completely.
   - Scores are updated correctly in console/logs (actual rendering on-screen comes in the next step).
