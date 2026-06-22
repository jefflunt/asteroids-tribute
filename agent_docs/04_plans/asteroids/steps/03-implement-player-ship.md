# Step 3: Implement Player Ship

## Goal
Build the triangular player ship entity with rotational movement (keys `A`/`D`), forward thrust acceleration (key `W`), hyperspace teleportation (key `S`), and retro vector drawing. "Done" means the ship renders in the center of the canvas and can be controlled smoothly with inertia/friction, wrapping around screen boundaries when moved.

## Context
The player ship is the main interactive game entity. It utilizes the physics and screen wrapping utilities defined in Step 2. Keyboard listeners are bound in `main.ts` or a dedicated manager to drive input.

## Files to Edit/Create
- `src/entities/ship.ts` (Create)
- `src/main.ts` (Edit)

## Proposed Logic & Implementation Details
1. **Ship Class Structure (`src/entities/ship.ts`)**:
   - Properties: `position: Vector2D`, `velocity: Vector2D`, `angle: number` (in radians, pointing upward by default: `-Math.PI / 2`), `radius: number` (for rendering and collision, e.g., 15 pixels), `thrusting: boolean`.
   - Ship Constants: `ROTATION_SPEED` (e.g., `4` radians/sec), `THRUST_ACCEL` (e.g., `200` pixels/sec²), `MAX_SPEED` (e.g., `300` pixels/sec), `DRAG_FACTOR` (e.g., `0.99` per frame or equivalent time-based decay).
2. **Movement and Input Integration**:
   - `rotate(direction: 'left' | 'right', deltaTime: number)`: Adjust `angle` by `direction * ROTATION_SPEED * deltaTime`.
   - `thrust(deltaTime: number)`: Calculate acceleration vector based on current `angle`: `accelX = Math.cos(angle) * THRUST_ACCEL`, `accelY = Math.sin(angle) * THRUST_ACCEL`. Add to `velocity`.
   - `update(deltaTime: number, width: number, height: number)`:
     - If thrusting, apply thrust.
     - Apply drag to velocity (from Step 2).
     - Clamp velocity to `MAX_SPEED` (from Step 2).
     - Add velocity to position.
     - Wrap position using `wrapPosition` (from Step 2).
3. **Hyperspace Jump (`S` key)**:
   - `hyperspace(width: number, height: number)`: Set position to a randomized `x` in `[0, width]` and randomized `y` in `[0, height]`. Instantly set `velocity = { x: 0, y: 0 }` to avoid immediate crash hazards.
4. **Drawing**:
   - `draw(ctx: CanvasRenderingContext2D)`:
     - Use Canvas path drawing (`beginPath`, `moveTo`, `lineTo`, `stroke`).
     - Draw an isosceles triangle pointing at `angle`. Points can be computed relative to center:
       - Front nose: `x = position.x + cos(angle) * radius`, `y = position.y + sin(angle) * radius`.
       - Rear left: `x = position.x + cos(angle + 140°) * radius`, `y = position.y + sin(angle + 140°) * radius`.
       - Rear right: `x = position.x + cos(angle - 140°) * radius`, `y = position.y + sin(angle - 140°) * radius`.
     - Set retro drawing style: `strokeStyle = '#ffffff'` (or neon/vector look), `lineWidth = 2`.
     - (Optional) Draw a small flame behind the ship if `thrusting` is active.
5. **Keyboard Input Binding (`src/main.ts`)**:
   - Add a key listener map to track active keys (e.g., `keysPressed: { [key: string]: boolean }`).
   - Listen for `keydown` and `keyup` for `'w'`, `'a'`, `'s'`, `'d'`.
   - Trigger ship hyperspace on a single press of `'s'` (do not trigger continuously while held).

## Verification & Tests
1. Start development server.
2. Verify the ship is rendered centered on the black canvas.
3. Test WASD:
   - Pressing `A` or `D` rotates the ship smoothly left or right.
   - Holding `W` accelerates the ship in the direction it faces.
   - Releasing `W` causes the ship to glide gracefully, decelerating slowly over time.
   - Ship wraps around screen boundaries perfectly when flown off-screen.
   - Pressing `S` teleports the ship to a random location and resets its velocity.
