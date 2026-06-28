# Step 1: Implement Arrow Keys and Hyperspace Input Handling

## Goal
Update keyboard input handling and game update state in `src/game.ts` to seamlessly map Arrow Keys alongside WASD. Ensure proper browser default prevention, prevent acceleration doubling under simultaneous inputs, and implement steering cancellation for opposing rotation inputs.

## Context
All changes reside inside the `Game` class in `src/game.ts`. We need to adapt `setupInput()` for arrow key listeners and `update()` for continuous input states.

## Files to Edit/Create
- `src/game.ts` (Edit)

## Proposed Logic & Implementation Details
1. **Prevent Browser Default Scrolling**:
   - In `setupInput()`, update the browser event default prevention check to include `'ArrowUp'`, `'ArrowDown'`, `'ArrowLeft'`, and `'ArrowRight'` keys.
   - Example check:
     ```typescript
     if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 's', 'w', 'a', 'd', 'm', 'M'].includes(e.key.toLowerCase()) || e.key === 'Enter') {
       e.preventDefault();
     }
     ```

2. **Map Down Arrow to Hyperspace**:
   - In `setupInput()` keydown listener, inside the `PLAYING` state check, add a check to trigger a hyperspace jump if `'arrowdown'` is pressed (provided it wasn't already pressed, preventing repeated jumps).
   - Merge with the existing `'s'` key check:
     ```typescript
     const isHyperspaceKey = key === 's' || key === 'arrowdown';
     const wasHyperspacePressed = this.keysPressed['s'] || this.keysPressed['arrowdown'];
     if (isHyperspaceKey && !wasHyperspacePressed) {
       this.ship.hyperspace(this.width, this.height);
       this.soundManager.playHyperspace();
     }
     ```

3. **Ship Continuous Movement Inputs & Safeguards**:
   - In `update(deltaTime)`, handle continuous inputs by incorporating both WASD and Arrow keys.
   - **Thrust**:
     - Retrieve input from both `'w'` and `'arrowup'`.
     - Set `this.ship.thrusting` to `true` if either is pressed.
     - Ensure this is evaluated as a binary condition so thrust doesn't double if both keys are held.
     ```typescript
     const thrustInput = !!this.keysPressed['w'] || !!this.keysPressed['arrowup'];
     this.ship.thrusting = thrustInput;
     this.soundManager.setThrust(thrustInput);
     ```
   - **Rotation & Steer Canceling**:
     - Retrieve rotation input values: left from `'a'` or `'arrowleft'`, and right from `'d'` or `'arrowright'`.
     - If both left and right inputs are active, they must cancel each other out (net zero rotation).
     ```typescript
     const leftInput = !!this.keysPressed['a'] || !!this.keysPressed['arrowleft'];
     const rightInput = !!this.keysPressed['d'] || !!this.keysPressed['arrowright'];

     if (leftInput && !rightInput) {
       this.ship.rotate('left', deltaTime);
     } else if (rightInput && !leftInput) {
       this.ship.rotate('right', deltaTime);
     }
     ```

## Verification & Tests
1. Verify compilation using TypeScript:
   ```bash
   npx tsc --noEmit
   ```
2. Run existing tests to ensure no regressions:
   ```bash
   npx vitest run src/game.test.ts
   ```
