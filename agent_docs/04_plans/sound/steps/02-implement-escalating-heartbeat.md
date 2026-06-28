# Step 2: Implement Escalating Heartbeat background rhythm

## Goal
Integrate an alternating two-note heartbeat (high/low pitch) background rhythm inside `SoundManager` that dynamically speeds up as the number of on-screen asteroids decreases.

## Context
Add background heartbeat state and timing handlers inside `src/utils/audio.ts`. This allows the heartbeat to run autonomously in the background without burdening the game's high-frequency update loops.

## Files to Edit/Create
- `src/utils/audio.ts` (Edit)

## Proposed Logic & Implementation Details
1. **Heartbeat State Variables**:
   - Add the following properties to the `SoundManager` class:
     - `heartbeatTimer: any = null;` (holds the current `setTimeout` id)
     - `heartbeatStep: boolean = true;` (alternates between two notes)
     - `heartbeatActive: boolean = false;` (tracks if heartbeat loop is running)
     - `asteroidsCount: number = 0;` (tracks active asteroids to adjust speed)

2. **Calculate Timing Interval**:
   - Create a helper getter/method `getHeartbeatInterval()`:
     - The pulse interval starts slow (e.g., 1.0 second) and dynamically speeds up (down to 0.25 seconds) proportional to the remaining number of asteroids:
       $$\text{Interval} = \max\left(0.25, \min\left(1.0, 0.25 + \frac{\text{Asteroids Count}}{10} \cdot 0.75\right)\right)$$
     - Ensure this formula handles various counts cleanly (e.g. if count is 0, interval is 0.25s).

3. **Alternating Notes Pulse**:
   - Create a method `playHeartbeatPulse()`:
     - If `ctx` or `masterGain` is null, or `isMuted` is true, return early.
     - Determine the frequency based on `heartbeatStep`:
       - Note A (if `heartbeatStep` is true): Triangle wave at 110 Hz.
       - Note B (if `heartbeatStep` is false): Triangle wave at 98 Hz.
     - Flip `heartbeatStep` (`this.heartbeatStep = !this.heartbeatStep`).
     - Play the note:
       - Create an oscillator.
       - Create a gain node.
       - Connect oscillator -> gain -> `masterGain`.
       - Gain envelope: starts at 0.15 and ramps down to 0 over 0.1 seconds.
       - Start the oscillator and stop after 0.1 seconds.

4. **Heartbeat Recursive Loop**:
   - Create a method `startHeartbeat()`:
     - If `this.heartbeatActive` is already true, return early.
     - Set `this.heartbeatActive = true`.
     - Set `this.heartbeatStep = true`.
     - Define a recursive scheduler function `tick()`:
       - If `!this.heartbeatActive`, return.
       - Call `this.playHeartbeatPulse()`.
       - Retrieve the current interval from `this.getHeartbeatInterval()`.
       - Schedule next `tick` via `this.heartbeatTimer = setTimeout(tick, interval * 1000)`.
     - Start the first `tick()`.

5. **Stop Heartbeat**:
   - Create a method `stopHeartbeat()`:
     - Set `this.heartbeatActive = false`.
     - If `this.heartbeatTimer` is not null, call `clearTimeout(this.heartbeatTimer)` and set `this.heartbeatTimer = null`.

6. **Update Asteroid Count**:
   - Create a method `updateHeartbeatAsteroidsCount(count: number)`:
     - Update `this.asteroidsCount = count`.

## Verification & Tests
1. Verify compilation using TypeScript:
   ```bash
   npx tsc --noEmit
   ```
2. Double check that starting, updating, and stopping the heartbeat does not throw any errors.
