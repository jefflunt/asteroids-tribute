# Step 3: Add Input Handling Tests

## Goal
Add comprehensive unit tests in `src/game.test.ts` to test all new arrow key inputs, single-trigger action safety (preventing duplicate triggers on S or Down Arrow hold), dual-input thrust binary check (to avoid doubling acceleration), and steering cancellation for opposing directions. Ensure code coverage is maintained at 100%.

## Context
Tests are co-located in `src/game.test.ts` and use the `vitest` testing framework. We will add a new test block or multiple distinct tests to assert each input mapping and conflict safeguard behavior.

## Files to Edit/Create
- `src/game.test.ts` (Edit)

## Proposed Logic & Implementation Details
1. **Continuous Controls Verification**:
   - Write a test to simulate key presses of `'arrowup'`, `'arrowleft'`, and `'arrowright'` and check that they update the ship's physical behavior correctly.
   - Example behavior:
     - Holding `'arrowup'` sets `game.ship.thrusting = true` and `game.soundManager.setThrust(true)` is called.
     - Holding `'arrowleft'` rotates the ship left by calling `ship.rotate('left', deltaTime)`.
     - Holding `'arrowright'` rotates the ship right by calling `ship.rotate('right', deltaTime)`.

2. **Acceleration Protection**:
   - Verify that when both `'w'` and `'arrowup'` are pressed simultaneously, `ship.thrusting` is `true` but its effect/acceleration does not double (the binary state remains singular).

3. **Steering Cancellation**:
   - Write tests for opposing direction inputs held simultaneously:
     - `'a'` + `'arrowright'`
     - `'d'` + `'arrowleft'`
     - `'arrowleft'` + `'arrowright'`
     - `'a'` + `'d'`
   - Assert that when opposing steering keys are active, the net rotation is zero (no rotation is applied).

4. **Single-Trigger Hyperspace and Repeat Mitigation**:
   - Verify that pressing `'arrowdown'` triggers a hyperspace jump and plays the hyperspace sound.
   - Verify that holding `'arrowdown'` or `'s'` does not continuously trigger multiple hyperspace jumps.

5. **Menu Text Assertion**:
   - Add a test or spy to assert that `drawMenu` renders the updated Option C control instruction strings via `ctx.fillText`.

## Verification & Tests
1. Run the test suite:
   ```bash
   npx vitest run src/game.test.ts
   ```
2. Verify test output indicates all tests pass and coverage remains at 100%.
