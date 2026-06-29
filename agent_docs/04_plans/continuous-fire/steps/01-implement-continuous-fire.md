# Step 1: Implement Continuous Firing State and Input Logic

## Goal
Implement continuous automatic firing when holding the Spacebar, with a 200ms cooldown, first-shot responsiveness, continuous polling at the 6-bullet limit, and instant cooldown reset on Spacebar release.

## Context
All changes are contained within the `Game` class in `src/game.ts`. The state and timing checks must be integrated cleanly within the existing keyboard event handlers and game update loop.

## Files to Edit/Create
- `src/game.ts` (Edit)

## Proposed Logic & Implementation Details
1. **Define Cooldown State**:
   - Add a public/private property `bulletFireCooldown: number` to the `Game` class in `src/game.ts`.
   - Initialize it to `0` inside the `Game` constructor or inside `resetEntities()`.

2. **First-Shot Responsiveness**:
   - In `setupInput()`, locate the `'keydown'` event listener.
   - Within the `PLAYING` state check, update the Spacebar (`key === ' '`) handling:
     - Check if the key was NOT already pressed (`!this.keysPressed[' ']`).
     - If true, fire a bullet instantly by calling `this.fireBullet()` and set `this.bulletFireCooldown = 0.2` seconds.
     - This guarantees immediate responsiveness when tapping or beginning to hold the Spacebar, while ensuring the event doesn't repeatedly trigger on system key-repeat.

3. **Instant Cooldown Reset on Release**:
   - In `setupInput()`, locate the `'keyup'` event listener.
   - For the Spacebar key (`key === ' '`), set `this.bulletFireCooldown = 0`.
   - This bypasses the continuous-fire cooldown entirely on release, allowing rapid manual tapping.

4. **Continuous Firing Update Loop & Polling**:
   - In `update(deltaTime)`, decrement the cooldown if it's active:
     ```typescript
     if (this.bulletFireCooldown > 0) {
       this.bulletFireCooldown -= deltaTime;
     }
     ```
   - Check if the Spacebar is currently held down and the cooldown has elapsed:
     ```typescript
     if (this.keysPressed[' '] && this.bulletFireCooldown <= 0) {
       if (this.bullets.length < 6) {
         this.fireBullet();
         this.bulletFireCooldown = 0.2;
       }
     }
     ```
   - **Continuous Polling**: Note that if the Spacebar is held down (`this.keysPressed[' '] === true`) and `this.bulletFireCooldown <= 0` but `this.bullets.length === 6`, we do NOT reset the cooldown. It remains `<= 0`. This ensures that on the very next game update frame where a bullet becomes inactive (reducing active bullets count below 6), a new bullet is fired immediately.

## Verification & Tests
1. Verify compilation using TypeScript:
   ```bash
   npx tsc --noEmit
   ```
2. Run existing tests to ensure no regressions:
   ```bash
   npx vitest run src/game.test.ts
   ```
