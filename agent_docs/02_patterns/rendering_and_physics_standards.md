# Pattern: Rendering & Physics Standards

## Context
In interactive 2D gameplay, rendering and physics must remain consistent, predictable, and fluid across a vast range of hardware devices and monitor refresh rates (e.g., 60Hz, 144Hz, 240Hz, or under-performing systems). Without frame-independent physics, a game runs too fast on high-refresh screens or too slow on weak systems. Furthermore, wrapping entities around screen boundaries in a classic arcade format requires continuous, robust analytical calculations to prevent entities from flickering, disappearing, or escaping the viewport limits entirely.

---

## Standard
1. **Vector-Based Representation**: Every physical object (such as a Ship, Asteroid, or Bullet) must represent its coordinates and velocity using the explicit `Vector2D` interface:
   ```typescript
   export interface Vector2D {
     x: number;
     y: number;
   }
   ```
2. **Frame-Independent Motion**: All velocity adjustments (acceleration) and spatial translations (movement) must be scaled by `deltaTime` (expressed in seconds):
   ```typescript
   position.x += velocity.x * deltaTime;
   position.y += velocity.y * deltaTime;
   ```
3. **Continuous Screen Wrapping**: Rather than resetting coordinates at arbitrary buffer margins, entities that drift beyond the viewport boundaries must instantly wrap around using the `wrapPosition` utility, which supports negative and positive bounds:
   - If `position.x < 0`, `position.x += width`
   - If `position.x > width`, `position.x -= width`
   - If `position.y < 0`, `position.y += height`
   - If `position.y > height`, `position.y -= height`
4. **Framerate-Independent Drag/Friction**: To prevent continuous thrusting from accelerating objects into infinity, velocity must decay via exponential drag. To ensure the drag is independent of frame rates, drag factors must be adjusted mathematically using the power formula `Math.pow(dragFactor, deltaTime * 60)`.
5. **Strict Velocity Clamping**: High velocities can lead to collision tunneling or visual tearing. Movement velocity magnitudes must be checked against explicit caps and scaled down using `limitSpeed`.

---

## Why
Using a `deltaTime`-based animation loop guarantees consistent game speed across all hardware. 

Applying drag exponentially using `Math.pow(dragFactor, deltaTime * 60)` simulates friction accurately regardless of the timestep frequency. The standard `velocity *= drag` pattern decays too quickly on 144Hz screens and too slowly on 60Hz screens, whereas the exponential formula adjusts the decay factor to align with actual real-world seconds.

Continuous analytical screen wrapping via `wrapPosition` ensures flawless visual wrapping. Checking and clamping velocities via `limitSpeed` avoids extreme acceleration bugs (e.g., the ship instantly jumping off-screen or out-pacing bullet ranges).

---

## Examples

### 1. Pure Physics Utilities (`src/utils/physics.ts`)
The core physics helper functions provide frame-independent drag calculations and safe speed-limiting vectors:

```typescript
import { Vector2D } from './physics';

/**
 * Wraps a position vector around screen boundaries of width and height.
 */
export function wrapPosition(pos: Vector2D, width: number, height: number): Vector2D {
  let x = pos.x;
  let y = pos.y;

  if (x < 0) {
    x += width;
  } else if (x > width) {
    x -= width;
  }

  if (y < 0) {
    y += height;
  } else if (y > height) {
    y -= height;
  }

  return { x, y };
}

/**
 * Applies exponential drag (friction) to velocity based on deltaTime.
 * To make it independent of framerate, we raise to the power of (deltaTime * 60).
 */
export function applyDrag(velocity: Vector2D, dragFactor: number, deltaTime: number): Vector2D {
  const factor = Math.pow(dragFactor, deltaTime * 60);
  return {
    x: velocity.x * factor,
    y: velocity.y * factor
  };
}

/**
 * Limits speed (magnitude of velocity vector) to maxSpeed.
 */
export function limitSpeed(velocity: Vector2D, maxSpeed: number): Vector2D {
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  if (speed > maxSpeed && speed > 0) {
    return {
      x: (velocity.x / speed) * maxSpeed,
      y: (velocity.y / speed) * maxSpeed
    };
  }
  return { x: velocity.x, y: velocity.y };
}
```

### 2. Application in Entity Updates (`src/entities/ship.ts`)
The `Ship` class demonstrates vector manipulation, acceleration, exponential drag application, speed clamping, and wrapping combined in a single timestep update:

```typescript
update(deltaTime: number, width: number, height: number): void {
  // 1. Accelerate ship forward if thruster is active
  if (this.thrusting) {
    this.velocity.x += Math.cos(this.angle) * THRUST_ACCEL * deltaTime;
    this.velocity.y += Math.sin(this.angle) * THRUST_ACCEL * deltaTime;
  }

  // 2. Apply drag / friction (independent of FPS)
  this.velocity = applyDrag(this.velocity, DRAG_FACTOR, deltaTime);

  // 3. Limit ship's maximum speed
  this.velocity = limitSpeed(this.velocity, MAX_SPEED);

  // 4. Move ship
  this.position.x += this.velocity.x * deltaTime;
  this.position.y += this.velocity.y * deltaTime;

  // 5. Wrap around screen boundaries
  this.position = wrapPosition(this.position, width, height);
}
```
