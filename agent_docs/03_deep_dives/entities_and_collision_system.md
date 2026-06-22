# Deep Dive: Entities & Collision System

## Overview
The Retro Asteroids Clone consists of three main physical entities that interact dynamically within a 2D viewport:
- `Ship` (`src/entities/ship.ts`): The player-controlled spacecraft.
- `Bullet` (`src/entities/bullet.ts`): High-velocity projectiles fired by the player.
- `Asteroid` (`src/entities/asteroid.ts`): Jagged, space debris that must be destroyed.

To ensure fast simulation speeds, these entities use simplified bounding-circle models for overlapping collision tests via helper mathematical sensors located in `src/utils/collision.ts`.

---

## Purpose
The primary purpose of this subsystem is to model individual physical objects, define their specific movement equations, and govern their physical interactions (such as collisions, splitting, and destruction). This document maps out these classes and explains the optimized bounding math that maintains high performance, even when dozens of objects are rendered simultaneously on the screen.

---

## Components

### 1. The Player Ship (`src/entities/ship.ts`)
The `Ship` is a triangular vector entity. Key characteristics include:
- **Rotational Control**: Rotates left or right at a rate of `4` radians/second.
- **Inertial Momentum**: Pressing `W` applies acceleration of `350` pixels/second² in the direction of the ship's current angle. When released, an exponential drag coefficient of `0.985` applies friction.
- **Speed Clamping**: Maximum velocity magnitude is strictly capped at `300` pixels/second.
- **Nose-Fired Projectiles**: Bullets spawn at the ship's front nose tip, calculated using simple trigonometric offsets:
  ```typescript
  const noseX = this.position.x + Math.cos(this.angle) * this.radius;
  const noseY = this.position.y + Math.sin(this.angle) * this.radius;
  ```
- **Flickering Visual States**: Features a flame thruster drawn when accelerating (flickers every 5 updates). Flashes every 150ms when under invulnerability.
- **Safety Features**: Starts with a 3.0s invulnerability window on game start or spawn. Hyperspace panic teleports the player to a random coordinate on the canvas, clears ship velocity, and grants a 1.5s invulnerability buffer.

### 2. Player Bullets (`src/entities/bullet.ts`)
`Bullet` objects are fast-moving projectile points:
- **Initial Velocity**: Travel at a speed of `500` pixels/second.
- **Maximum Lifespan**: Survival time is capped at `1.2` seconds. Upon expiration, `active` is flipped to `false`, freeing up a slot.
- **Limit Capacities**: Firing is capped at `6` active on-screen bullets simultaneously (managed in `game.ts`).

### 3. Jagged Asteroids (`src/entities/asteroid.ts`)
`Asteroid` objects are the main enemies in the game:
- **Size Characteristics**:
  - `Large`: Radius `40`, Score value `50` pts, Speed range `30-60` px/sec.
  - `Medium`: Radius `20`, Score value `75` pts, Speed range `50-100` px/sec.
  - `Small`: Radius `10`, Score value `100` pts, Speed range `80-150` px/sec.
- **Irregular Render Offsets**: When created, the asteroid pre-generates 10 radial percentage offsets (ranging from `-0.15` to `0.15`). These are cached in `offsets` and used during drawing routines to render a jagged shape. Since they are pre-calculated once, the shapes remain visually identical without flickering between frames.
- **Splitting Routines**:
  - A `Large` asteroid splits into 2 `Medium` asteroids with speeds of `75` px/sec traveling in opposite directions with a slight random spread.
  - A `Medium` asteroid splits into 2 `Small` asteroids traveling at `115` px/sec.
  - A `Small` asteroid disappears entirely upon being hit.
- **Safe Wave Spawning**: Spawns a list of large asteroids. To prevent unfair immediate player deaths, coordinates are recursively randomized and only spawned if they reside at least `150px` away from the ship's center coordinates.

### 4. Collision Mathematical Sensors (`src/utils/collision.ts`)
Provides low-level overlapping detectors using bounding circle math:
- **Circle-Circle Overlaps**: Checks if two circles overlap using the centers `p1, p2` and radii `r1, r2`.
- **Point-Circle Overlaps**: Checks if a single point falls inside a circle by treating the point as a circle with radius `0`.

---

## Data Flow
The lifetime of collision detection on any single tick flows as follows:

```
                  ┌──────────────────────┐
                  │ game.update(delta)   │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   checkCollisions()  │
                  └──────────┬───────────┘
                             │
         ┌───────────────────┴───────────────────┐
         ▼                                       ▼
1. Bullet-Asteroid Collision            2. Ship-Asteroid Collision
   ├── Loop bullets (b) & asteroids (a)    ├── Check if ship is invulnerable (if yes -> skip)
   ├── Run checkCircleCollision()          ├── Loop asteroids (a)
   ├── If overlapping:                     ├── Run checkCircleCollision()
   │   ├── Deactivate bullet (active=false)├── If overlapping:
   │   ├── Call asteroid.split()           │   ├── Reset ship position to center
   │   ├── Spliced-in child asteroids      │   ├── Clear ship velocity to (0,0)
   │   ├── Add score based on size value   │   ├── Reset ship angle pointing up
   │   └── Break inner loop for bullet b   │   └── Call triggerInvulnerability(3.0)
   └── Remove inactive bullets             └── Break loop to avoid multiple hits
```

---

## Concerns & Constraints

### 1. Bounding Circle vs. Rendering Shapes
Since asteroids are rendered as highly irregular jagged shapes, an exact polygon collision check would require complex edge-intersection mathematics, which is computationally expensive. By checking simplified circle collisions (using `radius` representing the average circle width), we achieve an extremely fast $O(N \cdot M)$ comparison check. The visual difference is imperceptible to players because the jagged offsets are within 15% of the true radius.

### 2. Avoiding Performance Bottlenecks
Standard Euclidean distance calculations call `Math.sqrt()`:
$$d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$
However, square roots are highly taxing CPU operations. In standard games with multiple bullets and dozens of asteroid fragments, calling `Math.sqrt` on every pairwise comparison inside a nested loop can cause lag. 

To eliminate this bottleneck, our collision helpers compare **squared distances** against the **squared sum of radii**, completely bypassing the need for square roots:
```typescript
export function checkCircleCollision(p1: Vector2D, r1: number, p2: Vector2D, r2: number): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distSq = dx * dx + dy * dy; // Distance squared
  const radiiSum = r1 + r2;
  const radiiSumSq = radiiSum * radiiSum; // Radii sum squared

  return distSq < radiiSumSq; // Bypasses costly Math.sqrt()
}
```
This optimization ensures our game loop can handle hundreds of entities at a stable 60+ FPS.
