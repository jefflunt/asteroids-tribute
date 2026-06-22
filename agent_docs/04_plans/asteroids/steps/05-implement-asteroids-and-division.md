# Step 5: Implement Asteroids and Division

## Goal
Implement asteroids of three distinct sizes, complete with random movement, vector wireframe rendering, and a division mechanic. "Done" means big asteroids split into two medium asteroids, medium split into two small, and small disappear when hit (split/destruction handled programmatically, with hook points for collision).

## Context
Asteroids are the primary obstacles in the game. They must look irregular (retro vector art) and drift slowly. They have three sizes: Large, Medium, and Tiny/Small, each with specific score values.

## Files to Edit/Create
- `src/entities/asteroid.ts` (Create)
- `src/main.ts` (Edit)

## Proposed Logic & Implementation Details
1. **Asteroid Size Enumeration / Types**:
   - Define a type or enum for size: `Large`, `Medium`, `Small` (or `Tiny`).
   - Define radii and scores per size:
     - `Large`: radius = `40`, score = `50` points, speed range = `30-60` px/sec.
     - `Medium`: radius = `20`, score = `75` points, speed range = `50-100` px/sec.
     - `Small`: radius = `10`, score = `100` points, speed range = `80-150` px/sec.
2. **Jagged Shape Generation**:
   - To render jagged circular asteroids that do not flicker, pre-generate random radius offsets in the constructor.
   - Example:
     ```typescript
     class Asteroid {
       position: Vector2D;
       velocity: Vector2D;
       size: 'Large' | 'Medium' | 'Small';
       radius: number;
       offsets: number[] = [];
       // ...
       constructor(pos: Vector2D, size: 'Large' | 'Medium' | 'Small') {
         // Set radius according to size
         // Populate offsets array with 8 to 12 random values between -0.2 and 0.2
         // representing percentage radius deviation for rendering.
       }
     }
     ```
3. **Asteroid Drawing**:
   - `draw(ctx: CanvasRenderingContext2D)`:
     - Use path drawing. Loop around `2 * Math.PI` using the number of offsets (e.g., 10 points).
     - For each angle `theta_i = (i / total_points) * 2 * Math.PI`:
       - `currentRadius = radius * (1 + offsets[i])`.
       - `x = position.x + Math.cos(theta_i) * currentRadius`.
       - `y = position.y + Math.sin(theta_i) * currentRadius`.
     - Close path and stroke white (`#ffffff`).
4. **Asteroid Split Mechanics**:
   - Add a method `split(): Asteroid[]` inside `Asteroid`:
     - If `size === 'Large'`, return two new `Medium` asteroids at the current position with randomized, slightly higher velocities in different directions.
     - If `size === 'Medium'`, return two new `Small` asteroids similarly.
     - If `size === 'Small'`, return an empty array `[]` (fully destroyed).
5. **Initial Spawning Manager**:
   - Implement an initial spawn function `spawnAsteroidWave(count: number, width: number, height: number, shipPos: Vector2D): Asteroid[]`:
     - Place asteroids randomly on screen.
     - Critical safety rule: ensure asteroids do not spawn too close to the ship's initial central position (e.g., minimum distance of `150` pixels) to avoid unfair instant death.

## Verification & Tests
1. Start development server.
2. Spawn a couple of Big asteroids on page load.
3. Verify that:
   - Asteroids render as static, jagged, retro-style circles that do not flicker.
   - They slowly drift across the screen and wrap seamlessly.
   - They do not spawn directly on top of the centered ship.
