# Step 2: Implement Physics and Wrapping Utilities

## Goal
Establish the coordinate system, common 2D vectors, speed clamps, inertial drag, and boundary screen-wrapping utility functions. "Done" means we have helper functions under `src/utils/physics.ts` fully implemented and unit-tested (or verified) to govern entity movement.

## Context
All game entities (Ship, Bullets, Asteroids) exist in a 2D space of size (width x height) and share the same movement behaviors: updating position by adding velocity, wrapping around screen boundaries when drifting off, and clamping velocities. Centralizing this logic avoids duplication and guarantees identical wrapping and physics rules.

## Files to Edit/Create
- `src/utils/physics.ts` (Create)

## Proposed Logic & Implementation Details
1. **Coordinate & Vector Types**:
   - Define a simple 2D vector interface/type:
     ```typescript
     export interface Vector2D {
       x: number;
       y: number;
     }
     ```
2. **Screen Wrapping**:
   - Write a function `wrapPosition(pos: Vector2D, width: number, height: number): void` (or returning a new `Vector2D`) that keeps coordinates within `[0, width]` and `[0, height]`.
   - Ensure wrapping handles entity size/radius or wraps instantly when the center point crosses the border:
     - If `pos.x < 0`, set `pos.x += width`.
     - If `pos.x > width`, set `pos.x -= width`.
     - Same logic for `pos.y` and `height`.
3. **Inertial Drag / Friction**:
   - Write a function `applyDrag(velocity: Vector2D, dragFactor: number, deltaTime: number): Vector2D` where velocity is scaled down over time.
   - Example math: `velocity.x *= Math.pow(dragFactor, deltaTime)` or simple linear decay, ensuring drag does not reverse the direction.
4. **Velocity Clamping**:
   - Write a function `limitSpeed(velocity: Vector2D, maxSpeed: number): Vector2D`.
   - Calculate speed as `Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)`.
   - If speed exceeds `maxSpeed`, scale velocity down to match `maxSpeed`.

## Verification & Tests
1. Since we do not have a test framework yet, write a small set of validation functions or manual checks inside `main.ts` (or temporary console logs) to verify:
   - Wrapping is correct for negative inputs (e.g., `x = -5` should wrap to `width - 5`).
   - Velocity clamp keeps vector length within limits.
   - Drag correctly decreases speed towards zero.
2. Clean up any temporary verification logs before completing the step.
