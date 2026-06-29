# Step 2: Add Unit Tests for Continuous Firing and Input Logic

## Goal
Add comprehensive, deterministic unit tests in `src/game.test.ts` to thoroughly verify all aspects of continuous automatic firing, manual tap-firing responsiveness, cooldown timing, key release reset, and continuous polling when hitting the 6-bullet limit. Achieve 100% test coverage for the newly added code paths.

## Context
All changes reside inside the `Game State and Loop Manager` test suite in `src/game.test.ts`. Tests must run deterministically by manually simulating keyboard events and updating the game loop with specific delta times.

## Files to Edit/Create
- `src/game.test.ts` (Edit)

## Proposed Logic & Implementation Details
Add a new test block inside `describe('Game State and Loop Manager', ...)` to verify continuous firing:

1. **Test Cooldown Initialization**:
   - Verify `bulletFireCooldown` starts at `0` upon initialization and new game start.

2. **Test First-Shot Responsiveness**:
   - Trigger a simulated keydown for the Spacebar (`' '`).
   - Verify `fireBullet()` is called immediately and `bulletFireCooldown` is set to `0.2`.
   - Simulate another keydown for Spacebar (held key event repeat) and verify no additional bullet is fired.

3. **Test Continuous Firing Cooldown Timing**:
   - Set `keysPressed[' '] = true` and call `update(0.1)`. Verify no 2nd bullet has fired.
   - Call `update(0.1)` again (total 0.2 sec). Verify a 2nd bullet has successfully fired and cooldown is reset to `0.2`.

4. **Test Instant Cooldown Reset on Keyup**:
   - Set `bulletFireCooldown = 0.2`.
   - Trigger a simulated keyup event for Spacebar (`' '`).
   - Verify `bulletFireCooldown` is reset to `0` instantly.

5. **Test Manual Rapid Tap-Firing**:
   - Simulate a sequence of rapid spacebar presses and releases (tapping).
   - Tap 1: keydown Spacebar (fires bullet, cooldown set to 0.2), keyup Spacebar (cooldown reset to 0).
   - Tap 2: keydown Spacebar (fires bullet, cooldown set to 0.2), keyup Spacebar (cooldown reset to 0).
   - Verify that multiple bullets are successfully fired in rapid succession without being restricted by the 200ms automatic firing cooldown.

6. **Test Continuous Polling at the 6-Bullet Limit**:
   - Fill the bullets array with 6 active bullets.
   - Set `keysPressed[' '] = true` and update the game loop by `0.2` seconds.
   - Verify no 7th bullet is fired and `bulletFireCooldown` is `<= 0`.
   - Deactivate one of the active bullets (e.g. set its `active = false` and update/filter the bullets list).
   - Call `update(0.016)` (one frame).
   - Verify that a new bullet is fired immediately on this frame and `bulletFireCooldown` is reset to `0.2`.

## Verification & Tests
1. Run the entire test suite using Vitest:
   ```bash
   npx vitest run src/game.test.ts
   ```
2. Verify all tests pass cleanly.
