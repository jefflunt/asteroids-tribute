# Step 5: Add Audio Test Mocks and Vitest Coverage

## Goal
Add testing coverage and mocks for `SoundManager` to ensure standard tests run flawlessly in Node/Vitest environments.

## Context
Create a test file `src/utils/audio.test.ts` to mock Web Audio API interfaces and verify the functionality of `SoundManager`.

## Files to Edit/Create
- `src/utils/audio.test.ts` (Create)

## Proposed Logic & Implementation Details
1. **Mock Web Audio API Globals**:
   - Since Vitest runs in JSDOM or a Node context where `window.AudioContext` does not exist, we need to declare global mocks for:
     - `AudioContext`
     - `GainNode`
     - `OscillatorNode`
     - `BiquadFilterNode`
     - `AudioBuffer`
     - `AudioBufferSourceNode`
   - In `src/utils/audio.test.ts`:
     - Define simple stub mock classes/objects before running tests:
       ```typescript
       class MockAudioNode {
         connect = vi.fn();
         disconnect = vi.fn();
       }
       class MockGainNode extends MockAudioNode {
         gain = {
           setValueAtTime: vi.fn(),
           linearRampToValueAtTime: vi.fn(),
           exponentialRampToValueAtTime: vi.fn(),
           value: 1.0
         };
       }
       class MockOscillatorNode extends MockAudioNode {
         type = 'sine';
         frequency = {
           setValueAtTime: vi.fn(),
           linearRampToValueAtTime: vi.fn(),
           exponentialRampToValueAtTime: vi.fn()
         };
         start = vi.fn();
         stop = vi.fn();
       }
       class MockBiquadFilterNode extends MockAudioNode {
         type = 'lowpass';
         frequency = {
           setValueAtTime: vi.fn()
         };
       }
       class MockAudioContext {
         state = 'suspended';
         currentTime = 0;
         destination = {};
         createGain = vi.fn().mockImplementation(() => new MockGainNode());
         createOscillator = vi.fn().mockImplementation(() => new MockOscillatorNode());
         createBiquadFilter = vi.fn().mockImplementation(() => new MockBiquadFilterNode());
         createBuffer = vi.fn().mockImplementation(() => ({
           getChannelData: vi.fn().mockReturnValue(new Float32Array(44100))
         }));
         createBufferSource = vi.fn().mockImplementation(() => ({
           buffer: null,
           connect: vi.fn(),
           start: vi.fn(),
           stop: vi.fn()
         }));
         resume = vi.fn().mockImplementation(() => {
           this.state = 'running';
           return Promise.resolve();
         });
       }
       ```
     - Attach these mocks to the global scope:
       ```typescript
       beforeAll(() => {
         global.AudioContext = MockAudioContext as any;
         (global as any).webkitAudioContext = MockAudioContext as any;
       });
       ```

2. **SoundManager Unit Tests**:
   - Write unit tests for `SoundManager`:
     - **Safe Setup**: Assert that instantiating `SoundManager` initializes the `AudioContext` correctly.
     - **Mute Preferences**: Mock `localStorage` methods (`getItem`, `setItem`). Verify that calling `setMute(true)` updates the master gain to 0 and setting it to false restores it to 1.
     - **Sound Execution Paths**: Verify that calling sound effects (`playFire`, `playExplosion`, `playShipDeath`, `playHyperspace`) runs without raising exceptions.
     - **Thruster Management**: Test that calling `setThrust(true)` creates an active oscillator and `setThrust(false)` properly tears it down.
     - **Heartbeat Loop**: Test that starting and stopping the heartbeat functions as expected under simulated timing (using Vitest's fake timers `vi.useFakeTimers()`).

## Verification & Tests
1. Run all unit tests including the new ones:
   ```bash
   npm run test
   ```
2. Verify typescript types and checks:
   ```bash
   npx tsc --noEmit
   ```
   Ensuring everything passes cleanly.
