# Step 4: Implement Persistent Mute Toggle and Menu UI Indicator

## Goal
Add a persistent mute/unmute button on the canvas title/menu screen using browser `localStorage` to save user mute preferences and display a visual status overlay.

## Context
Extend key input handling and canvas render routines in `src/game.ts` to allow toggling mute using the `M` key and show visual indicators on-screen.

## Files to Edit/Create
- `src/game.ts` (Edit)

## Proposed Logic & Implementation Details
1. **Handle M key on Keydown**:
   - In `src/game.ts` `setupInput()` inside keydown event listener:
     - Check if key is `'m'`:
       - Toggle the mute state:
         ```typescript
         const nextMuteState = !this.soundManager.isMuted;
         this.soundManager.setMute(nextMuteState);
         localStorage.setItem('asteroids_sound_muted', String(nextMuteState));
         ```
       - Make sure to prevent default keyboard scroll behaviors for key `'m'`.

2. **Initialize Mute preference on Load**:
   - In `src/game.ts` constructor or SoundManager instantiation:
     - On load, read `localStorage.getItem('asteroids_sound_muted') === 'true'`.
     - Pass that boolean to `this.soundManager.setMute(storedMuted)`.

3. **Draw Mute instruction on Title Menu**:
   - In `src/game.ts` `drawMenu(ctx)`:
     - Add a visual prompt line under the controls description:
       ```typescript
       ctx.fillText(`M = TOGGLE MUTE [${this.soundManager.isMuted ? 'MUTED' : 'ON'}]`, this.width / 2, this.height / 2 + 175);
       ```
     - Make sure the menu layout spacing accommodates this new line cleanly.

4. **Draw Mute Status in Gameplay Overlay**:
   - In `src/game.ts` `drawGameplay(ctx)`:
     - Draw a small text indicator (e.g. `SOUND: ON` or `SOUND: MUTED`) in the upper-right corner or a subtle spot on the screen so players always know the current state.
     - For example, next to the SCORE or WAVE display:
       ```typescript
       ctx.fillText(`SOUND: ${this.soundManager.isMuted ? 'MUTED' : 'ON'}`, this.width - 20, 60);
       ```

## Verification & Tests
1. Run Vitest checking that existing tests still pass:
   ```bash
   npm run test
   ```
2. Verify compilation using TypeScript:
   ```bash
   npx tsc --noEmit
   ```
