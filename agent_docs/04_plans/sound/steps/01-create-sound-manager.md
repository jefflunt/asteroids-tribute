# Step 1: Create SoundManager and Procedural Sound Effects

## Goal
Build a decoupled `SoundManager` class in `src/utils/audio.ts` utilizing the browser's Web Audio API to procedurally synthesize retro arcade sound effects (laser fire, asteroid explosions, ship thruster engine, hyperspace jump, ship explosion) without loading external audio assets.

## Context
Create a new file `src/utils/audio.ts`. It acts as the core procedural audio service, encapsulating all Web Audio API logic and keeping the rest of the codebase clean from low-level synthesis logic.

## Files to Edit/Create
- `src/utils/audio.ts` (Create)

## Proposed Logic & Implementation Details
1. **Class Definition & Safe Initialization**:
   - Define a `SoundManager` class.
   - Keep properties:
     - `ctx: AudioContext | null = null;`
     - `masterGain: GainNode | null = null;`
     - `thrustOscillator: OscillatorNode | null = null;`
     - `thrustGain: GainNode | null = null;`
     - `isMuted: boolean = false;`
     - `noiseBuffer: AudioBuffer | null = null;`
   - In the constructor, safely try to instantiate `AudioContext` (e.g. `new (window.AudioContext || (window as any).webkitAudioContext)()`) inside a `try/catch` block. If it fails or is undefined (like in JSDOM testing), leave `ctx` as `null` so the game doesn't crash on start.
   - If `ctx` is successfully initialized:
     - Create `masterGain = ctx.createGain()`.
     - Connect `masterGain` to `ctx.destination`.
     - Read the initial mute state from `localStorage.getItem('asteroids_sound_muted') === 'true'`.
     - Set `masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, ctx.currentTime)`.

2. **Resume Context (`init` method)**:
   - Modern browsers block audio context until a user interaction occurs.
   - Create a method `init()`:
     - If `ctx` exists and `ctx.state === 'suspended'`, call `ctx.resume()`.

3. **Mute Control (`setMute` method)**:
   - Create a method `setMute(mute: boolean)`:
     - Update `this.isMuted = mute`.
     - If `masterGain` and `ctx` exist, set `masterGain.gain.setValueAtTime(mute ? 0 : 1.0, ctx.currentTime)`.

4. **Laser Fire (`playFire` method)**:
   - If `ctx` or `masterGain` is null, or `isMuted` is true, return early.
   - Create a short oscillator (e.g., triangle or square wave, triangle wave sounds warmer and less harsh).
   - Create a `GainNode` for the laser envelope.
   - Connect oscillator -> gain node -> `masterGain`.
   - Set frequency sweep:
     - Start frequency at ~880 Hz at `ctx.currentTime`.
     - Exponentially ramp frequency down to ~110 Hz over 0.15 seconds using `exponentialRampToValueAtTime`.
   - Set volume envelope:
     - Start gain at a safe retro peak (e.g., 0.15) and ramp down to 0 over 0.15 seconds using `linearRampToValueAtTime`.
   - Call `start()` and schedule `stop(ctx.currentTime + 0.15)`.

5. **Explosions (`playExplosion` method)**:
   - Method signature: `playExplosion(size: 'small' | 'medium' | 'large')`.
   - White Noise Generation helper `getNoiseBuffer()`:
     - If `noiseBuffer` is cached, use it. Otherwise, create an `AudioBuffer` with 1 channel, sample rate of 44100, and duration of 1.0 second. Fill its channel data with random values between `-1.0` and `1.0`.
   - To play the sound:
     - Create an `AudioBufferSourceNode` with the noise buffer.
     - Create a `BiquadFilterNode` (lowpass or bandpass).
     - Create a `GainNode`.
     - Connect: source -> filter -> gain -> `masterGain`.
     - Configure parameters per size:
       - **Large**: Bandpass/lowpass filter at ~200 Hz. Gain starts at 0.3, decays to 0 over 0.5s.
       - **Medium**: Bandpass filter at ~500 Hz. Gain starts at 0.25, decays to 0 over 0.3s.
       - **Small**: Bandpass filter at ~1000 Hz. Gain starts at 0.2, decays to 0 over 0.15s.
     - Call `start()` and schedule `stop()` matching the decay time.

6. **Ship Death (`playShipDeath` method)**:
   - Use the white noise source.
   - Pass it through a low bandpass filter (around 150 Hz) for a heavy, deep, prolonged rumble.
   - Gain envelope: start at 0.3, decay to 0 over 1.2 seconds.

7. **Ship Thruster Engine (`setThrust` method)**:
   - Method signature: `setThrust(active: boolean)`.
   - The thruster engine hum is continuous as long as the player accelerates.
   - If `active` is true:
     - If `thrustOscillator` is already initialized, do nothing.
     - Create `thrustOscillator` as a low-frequency oscillator (e.g., triangle wave at 70 Hz).
     - Create a low-pass filter to make it sound muffled (frequency ~150 Hz).
     - Create `thrustGain` to control start/stop volume softly (to avoid audio clicks).
     - Connect: `thrustOscillator` -> filter -> `thrustGain` -> `masterGain`.
     - Ramp `thrustGain.gain` from 0 to 0.15 over 0.1 seconds.
     - Call `start()`.
   - If `active` is false:
     - If `thrustOscillator` is running, ramp `thrustGain.gain` to 0 over 0.1 seconds.
     - Stop and set `thrustOscillator = null` and `thrustGain = null` after the ramp completes.

8. **Hyperspace Jump (`playHyperspace` method)**:
   - Create an oscillator.
   - Sweep frequency up rapidly from 100 Hz to 2000 Hz over 0.2 seconds.
   - Set gain envelope to decay from 0.1 to 0 over 0.2 seconds.

## Verification & Tests
1. Verify compilation using TypeScript:
   ```bash
   npx tsc --noEmit
   ```
2. Open a temporary index page or check the file export correctness using simple typescript checks. Tests for this module will be fully fleshed out in Step 5.
