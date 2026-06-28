# Step 3: Integrate Audio Triggers into Game Coordinator

## Goal
Wire the `SoundManager` methods into the central `Game` coordinator to trigger sounds on laser firing, asteroid splitting, ship collision, ship thrusting, wave transition, and hyperspace jump, while ensuring safe browser autoplay resumption.

## Context
Integrate `SoundManager` triggers into `src/game.ts` and `src/main.ts`.

## Files to Edit/Create
- `src/game.ts` (Edit)
- `src/main.ts` (Edit)

## Proposed Logic & Implementation Details
1. **Import and Initialization in `Game`**:
   - In `src/game.ts`, import `SoundManager` from `./utils/audio`.
   - Add a property `soundManager: SoundManager;` to the `Game` class.
   - In the `Game` constructor:
     - Instantiate `this.soundManager = new SoundManager();`.

2. **Autoplay Browser Safety (`init` triggers)**:
   - In `src/game.ts` `setupInput()`, inside the keydown event listener:
     - Before processing any keyboard input (or right at the top of the callback), trigger `this.soundManager.init();` to safely resume/unlock the audio context on user action.

3. **Shooting Sound Trigger**:
   - In `src/game.ts` `fireBullet()`:
     - If the bullet was fired successfully, call `this.soundManager.playFire()`.

4. **Explosions Sound Triggers**:
   - In `src/game.ts` `checkCollisions()`, inside the Bullet-Asteroid collision check:
     - Before splitting or removing the asteroid, play the explosion matching its size:
       ```typescript
       let size: 'small' | 'medium' | 'large' = 'small';
       if (asteroid.radius > 30) {
         size = 'large';
       } else if (asteroid.radius > 15) {
         size = 'medium';
       }
       this.soundManager.playExplosion(size);
       ```

5. **Ship Death Sound Trigger**:
   - In `src/game.ts` `checkCollisions()`, inside the Ship-Asteroid collision check:
     - Just as the ship is hit and invulnerability is triggered, play the ship explosion sound:
       ```typescript
       this.soundManager.playShipDeath();
       ```

6. **Hyperspace Jump Sound Trigger**:
   - In `src/game.ts` setupInput inside keydown, or ship's hyperspace trigger:
     - Trigger `this.soundManager.playHyperspace()` when the user successfully initiates hyperspace with `S`.

7. **Ship Engine Thruster hum**:
   - In `src/game.ts` `update(deltaTime)`:
     - Check the keysPressed state: `const isThrusting = !!this.keysPressed['w'] && this.state === 'PLAYING';`.
     - Call `this.soundManager.setThrust(isThrusting);`.

8. **Heartbeat Lifecycle management**:
   - When a new game starts (`startNewGame()`):
     - Trigger `this.soundManager.startHeartbeat()`.
     - Immediately update the asteroid count to ensure correct initial speed:
       `this.soundManager.updateHeartbeatAsteroidsCount(this.asteroids.length)`.
   - When game is updating (`update(deltaTime)`):
     - If `this.state !== 'PLAYING'` or `this.waveTransitionActive` is true:
       - Stop the heartbeat: `this.soundManager.stopHeartbeat()`.
     - Else (normal active gameplay):
       - If heartbeat is active, update the asteroid count:
         `this.soundManager.updateHeartbeatAsteroidsCount(this.asteroids.length)`.
         If not active, call `this.soundManager.startHeartbeat()`.

## Verification & Tests
1. Run Vitest checking that existing tests still pass:
   ```bash
   npm run test
   ```
2. Verify compilation using TypeScript:
   ```bash
   npx tsc --noEmit
   ```
