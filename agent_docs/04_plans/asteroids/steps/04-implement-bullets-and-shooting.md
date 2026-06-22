# Step 4: Implement Bullets and Shooting

## Goal
Implement a weapon system allowing the ship to fire bullets using the `Spacebar`. "Done" means the player can shoot up to 6 bullets on screen simultaneously, with bullets traveling in the ship's facing direction and expiring after a short lifetime or distance.

## Context
Bullets are fast-moving, short-lived projectiles emitted from the tip of the player's ship. Managing bullet limits (max 6) prevents bullet spam and introduces a tactical gameplay constraint.

## Files to Edit/Create
- `src/entities/bullet.ts` (Create)
- `src/entities/ship.ts` (Edit)
- `src/main.ts` (Edit)

## Proposed Logic & Implementation Details
1. **Bullet Class (`src/entities/bullet.ts`)**:
   - Properties: `position: Vector2D`, `velocity: Vector2D`, `lifeRemaining: number` (in seconds, e.g., `1.5` or `2.0` seconds), `active: boolean`.
   - Constants: `BULLET_SPEED` (e.g., `500` pixels/sec).
   - `update(deltaTime: number, width: number, height: number)`:
     - Subtract `deltaTime` from `lifeRemaining`.
     - Add `velocity` * `deltaTime` to `position`.
     - Apply screen wrapping using `wrapPosition` (bullets wrap in classic Asteroids!).
     - Set `active = false` when `lifeRemaining <= 0`.
   - `draw(ctx: CanvasRenderingContext2D)`:
     - Draw as a small circle (radius: 1.5 - 2 pixels) or a short line vector matching the velocity vector.
     - Styling: pure white stroke/fill (`#ffffff`).
2. **Firing Handler in Ship (`src/entities/ship.ts` or `src/main.ts`)**:
   - Create a helper `shoot(): Bullet | null` in `Ship`:
     - Calculate launch point: the nose tip of the ship (`position.x + cos(angle) * radius`, `position.y + sin(angle) * radius`).
     - Calculate velocity vector: `velX = Math.cos(angle) * BULLET_SPEED`, `velY = Math.sin(angle) * BULLET_SPEED`.
     - Optionally add the ship's current velocity to the bullet's velocity for realistic inertial relative velocity, or keep it fixed speed (fixed is classic and easier to aim). Let's go with fixed `BULLET_SPEED` + a portion of ship speed or pure `BULLET_SPEED`.
3. **Bullet Array Management (`src/main.ts`)**:
   - Maintain an array `bullets: Bullet[]`.
   - On `keyup` or `keydown` for `' '` (Spacebar):
     - If `bullets.length < 6`, instantiate a new `Bullet` and push to the array.
     - Ensure single-shot behavior (the player must release and press Spacebar again to shoot, no continuous machine gun fire from holding space).
   - In the update loop:
     - Update all bullets, filter out inactive ones: `bullets = bullets.filter(b => b.active)`.

## Verification & Tests
1. Run Vite development server.
2. Tap the Spacebar to fire a single bullet from the tip of the ship.
3. Rapidly tap Spacebar and verify that:
   - There are never more than 6 bullets on screen at once.
   - If 6 bullets are on screen, tapping Spacebar does nothing.
   - Bullets travel in a straight line in the direction the ship was pointing.
   - Bullets wrap around boundaries.
   - Bullets expire/disappear after their lifetime (e.g., 1.5 seconds).
