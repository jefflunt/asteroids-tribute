import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { SoundManager } from './audio';

// Mock Web Audio API classes
class MockAudioNode {
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockGainNode extends MockAudioNode {
  gain = {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
    value: 1.0,
  };
}

class MockOscillatorNode extends MockAudioNode {
  type = 'sine';
  frequency = {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  start = vi.fn();
  stop = vi.fn();
}

class MockBiquadFilterNode extends MockAudioNode {
  type = 'lowpass';
  frequency = {
    setValueAtTime: vi.fn(),
  };
}

class MockAudioContext {
  state = 'suspended';
  currentTime = 12.34;
  sampleRate = 44100;
  destination = {};

  createGain = vi.fn().mockImplementation(() => new MockGainNode());
  createOscillator = vi.fn().mockImplementation(() => new MockOscillatorNode());
  createBiquadFilter = vi.fn().mockImplementation(() => new MockBiquadFilterNode());
  createBuffer = vi.fn().mockImplementation(() => ({
    getChannelData: vi.fn().mockReturnValue(new Float32Array(44100)),
  }));
  createBufferSource = vi.fn().mockImplementation(() => ({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  resume = vi.fn().mockImplementation(function (this: any) {
    this.state = 'running';
    return Promise.resolve();
  });
}

// LocalStorage mock
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn().mockImplementation((key: string) => store[key] || null),
  setItem: vi.fn().mockImplementation((key: string, value: string) => {
    store[key] = String(value);
  }),
  clear: vi.fn().mockImplementation(() => {
    for (const key in store) {
      delete store[key];
    }
  }),
  removeItem: vi.fn().mockImplementation((key: string) => {
    delete store[key];
  }),
};

describe('SoundManager', () => {
  let originalAudioContext: any;
  let originalLocalStorage: any;

  beforeAll(() => {
    originalAudioContext = (globalThis as any).AudioContext;
    originalLocalStorage = (globalThis as any).localStorage;

    (globalThis as any).AudioContext = MockAudioContext as any;
    (globalThis as any).webkitAudioContext = MockAudioContext as any;
    (globalThis as any).localStorage = localStorageMock as any;
  });

  afterAll(() => {
    (globalThis as any).AudioContext = originalAudioContext;
    (globalThis as any).webkitAudioContext = originalAudioContext;
    (globalThis as any).localStorage = originalLocalStorage;
  });

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  test('should safely initialize with AudioContext', () => {
    const manager = new SoundManager();
    expect(manager.ctx).toBeDefined();
    expect(manager.ctx).toBeInstanceOf(MockAudioContext);
    expect(manager.masterGain).toBeDefined();
    expect(manager.isMuted).toBe(false);
  });

  test('should handle environment with no AudioContext safely', () => {
    (globalThis as any).AudioContext = undefined;
    (globalThis as any).webkitAudioContext = undefined;

    const manager = new SoundManager();
    expect(manager.ctx).toBeNull();
    expect(manager.masterGain).toBeNull();

    // Reset back
    (globalThis as any).AudioContext = MockAudioContext as any;
    (globalThis as any).webkitAudioContext = MockAudioContext as any;
  });

  test('should read initial mute state from localStorage', () => {
    localStorageMock.setItem('asteroids_sound_muted', 'true');
    const manager = new SoundManager();
    expect(manager.isMuted).toBe(true);
  });

  test('init() should resume context if suspended', async () => {
    const manager = new SoundManager();
    manager.init();
    expect(manager.ctx?.resume).toHaveBeenCalled();
  });

  test('setMute(true) should mute the system and persist in localStorage', () => {
    const manager = new SoundManager();
    manager.setMute(true);
    expect(manager.isMuted).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('asteroids_sound_muted', 'true');
    expect(manager.masterGain?.gain.setValueAtTime).toHaveBeenCalledWith(0, manager.ctx!.currentTime);
  });

  test('setMute(false) should unmute the system and persist in localStorage', () => {
    const manager = new SoundManager();
    manager.setMute(false);
    expect(manager.isMuted).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('asteroids_sound_muted', 'false');
    expect(manager.masterGain?.gain.setValueAtTime).toHaveBeenCalledWith(1.0, manager.ctx!.currentTime);
  });

  test('playFire() should sweep oscillator and gain when active and unmuted', () => {
    const manager = new SoundManager();
    manager.playFire();

    expect(manager.ctx?.createOscillator).toHaveBeenCalled();
    expect(manager.ctx?.createGain).toHaveBeenCalled();
  });

  test('playFire() should do nothing when muted', () => {
    const manager = new SoundManager();
    manager.setMute(true);
    vi.clearAllMocks();

    manager.playFire();
    expect(manager.ctx?.createOscillator).not.toHaveBeenCalled();
  });

  test('playExplosion(size) should generate white noise buffer and route it through filters', () => {
    const manager = new SoundManager();

    // Large explosion
    manager.playExplosion('large');
    expect(manager.ctx?.createBuffer).toHaveBeenCalled();
    expect(manager.ctx?.createBufferSource).toHaveBeenCalled();
    expect(manager.ctx?.createBiquadFilter).toHaveBeenCalled();

    // Medium and Small explosions
    vi.clearAllMocks();
    manager.playExplosion('medium');
    expect(manager.ctx?.createBufferSource).toHaveBeenCalled();

    vi.clearAllMocks();
    manager.playExplosion('small');
    expect(manager.ctx?.createBufferSource).toHaveBeenCalled();
  });

  test('playExplosion() should do nothing when muted', () => {
    const manager = new SoundManager();
    manager.setMute(true);
    vi.clearAllMocks();

    manager.playExplosion('large');
    expect(manager.ctx?.createBufferSource).not.toHaveBeenCalled();
  });

  test('playShipDeath() should trigger filter low-frequency explosion rumble', () => {
    const manager = new SoundManager();
    manager.playShipDeath();

    expect(manager.ctx?.createBufferSource).toHaveBeenCalled();
    expect(manager.ctx?.createBiquadFilter).toHaveBeenCalled();
  });

  test('setThrust(true) should create thrust oscillator', () => {
    const manager = new SoundManager();
    manager.setThrust(true);

    expect(manager.thrustOscillator).toBeDefined();
    expect(manager.thrustGain).toBeDefined();
    expect(manager.ctx?.createOscillator).toHaveBeenCalled();
    expect(manager.ctx?.createGain).toHaveBeenCalled();

    // Call again to verify it does not re-create
    vi.clearAllMocks();
    manager.setThrust(true);
    expect(manager.ctx?.createOscillator).not.toHaveBeenCalled();
  });

  test('setThrust(false) should tear down thrust oscillator', () => {
    const manager = new SoundManager();
    manager.setThrust(true);
    expect(manager.thrustOscillator).toBeDefined();

    manager.setThrust(false);
    expect(manager.thrustOscillator).toBeNull();
    expect(manager.thrustGain).toBeNull();
  });

  test('playHyperspace() should sweep pitch up and decay gain', () => {
    const manager = new SoundManager();
    manager.playHyperspace();

    expect(manager.ctx?.createOscillator).toHaveBeenCalled();
    expect(manager.ctx?.createGain).toHaveBeenCalled();
  });

  describe('Heartbeat background rhythm', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('getHeartbeatInterval() should calculate intervals proportional to asteroid count', () => {
      const manager = new SoundManager();

      // 10 asteroids -> 0.25 + (10/10)*0.75 = 1.0s
      manager.updateHeartbeatAsteroidsCount(10);
      expect(manager.getHeartbeatInterval()).toBe(1.0);

      // 5 asteroids -> 0.25 + (5/10)*0.75 = 0.625s
      manager.updateHeartbeatAsteroidsCount(5);
      expect(manager.getHeartbeatInterval()).toBe(0.625);

      // 0 asteroids -> 0.25s
      manager.updateHeartbeatAsteroidsCount(0);
      expect(manager.getHeartbeatInterval()).toBe(0.25);

      // more than 10 asteroids -> clamped to 1.0s
      manager.updateHeartbeatAsteroidsCount(15);
      expect(manager.getHeartbeatInterval()).toBe(1.0);

      // negative asteroids -> clamped to 0.25s
      manager.updateHeartbeatAsteroidsCount(-5);
      expect(manager.getHeartbeatInterval()).toBe(0.25);
    });

    test('playHeartbeatPulse() should alternate between 110Hz and 98Hz notes', () => {
      const manager = new SoundManager();
      
      // Initially heartbeatStep is true -> Note A (110 Hz)
      const mockOscillator = {
        type: 'sine',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      };
      vi.spyOn(manager.ctx!, 'createOscillator').mockReturnValue(mockOscillator as any);

      manager.playHeartbeatPulse();
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(110, expect.any(Number));
      expect(manager.heartbeatStep).toBe(false);

      // Next call -> Note B (98 Hz)
      vi.clearAllMocks();
      manager.playHeartbeatPulse();
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(98, expect.any(Number));
      expect(manager.heartbeatStep).toBe(true);
    });

    test('startHeartbeat() and stopHeartbeat() should control recursive timeout loop', () => {
      const manager = new SoundManager();
      const playSpy = vi.spyOn(manager, 'playHeartbeatPulse');

      manager.updateHeartbeatAsteroidsCount(10); // Interval = 1.0s

      manager.startHeartbeat();
      expect(manager.heartbeatActive).toBe(true);
      expect(playSpy).toHaveBeenCalledTimes(1); // Immediate first pulse

      // Advance by 1 second -> should trigger second pulse
      vi.advanceTimersByTime(1000);
      expect(playSpy).toHaveBeenCalledTimes(2);

      // Advance by another 1 second -> third pulse
      vi.advanceTimersByTime(1000);
      expect(playSpy).toHaveBeenCalledTimes(3);

      // Stop heartbeat
      manager.stopHeartbeat();
      expect(manager.heartbeatActive).toBe(false);
      expect(manager.heartbeatTimer).toBeNull();

      // Advance time -> no more pulses should be triggered
      vi.advanceTimersByTime(1000);
      expect(playSpy).toHaveBeenCalledTimes(3);
    });

    test('startHeartbeat() should prevent duplicate active loops', () => {
      const manager = new SoundManager();
      const playSpy = vi.spyOn(manager, 'playHeartbeatPulse');

      manager.startHeartbeat();
      const firstTimerId = manager.heartbeatTimer;

      // Call start again
      manager.startHeartbeat();
      expect(manager.heartbeatTimer).toBe(firstTimerId);
      expect(playSpy).toHaveBeenCalledTimes(1);
    });
  });
});
