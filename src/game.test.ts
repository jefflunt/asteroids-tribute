import { describe, test, expect, vi } from 'vitest';
import { Game } from './game';
import { Asteroid } from './entities/asteroid';
import { Bullet } from './entities/bullet';

describe('Game State and Loop Manager', () => {
  test('should initialize with correct menu state and defaults', () => {
    const game = new Game(800, 600);
    expect(game.state).toBe('MENU');
    expect(game.score).toBe(0);
    expect(game.wave).toBe(1);
    expect(game.bullets.length).toBe(0);
    expect(game.asteroids.length).toBe(0);
  });

  test('should start new game correctly', () => {
    const game = new Game(800, 600);
    game.startNewGame();
    expect(game.state).toBe('PLAYING');
    expect(game.score).toBe(0);
    expect(game.wave).toBe(1);
    expect(game.asteroids.length).toBe(4); // 3 + wave = 4
    expect(game.ship.position).toEqual({ x: 400, y: 300 });
    expect(game.ship.isInvulnerable).toBe(true);
  });

  test('should update entities during playing state', () => {
    const game = new Game(800, 600);
    game.startNewGame();
    
    // Add a bullet
    const bullet = new Bullet(100, 100, 0, 500);
    game.bullets.push(bullet);

    game.update(0.1); // 0.1 seconds update

    // Bullet should have moved
    expect(bullet.position.x).toBeGreaterThan(100);
    // Ship should update tick count
    expect(game.tickCount).toBe(1);
  });

  test('should handle bullet-asteroid collisions and add score', () => {
    const game = new Game(800, 600);
    game.startNewGame();

    // Place asteroid and bullet in identical positions
    const targetAsteroid = new Asteroid({ x: 200, y: 200 }, 'Large');
    const bullet = new Bullet(200, 200, 0, 0); // Stationary bullet on target
    
    game.asteroids = [targetAsteroid];
    game.bullets = [bullet];

    game.checkCollisions();

    // Bullet should be destroyed
    expect(game.bullets.length).toBe(0);
    // Large asteroid is split into 2 Mediums
    expect(game.asteroids.length).toBe(2);
    expect(game.asteroids[0].size).toBe('Medium');
    // Score increases by Large asteroid scoreValue (50 points)
    expect(game.score).toBe(50);
  });

  test('should handle ship-asteroid collisions and trigger reset', () => {
    const game = new Game(800, 600);
    game.startNewGame();

    // Place asteroid directly on ship
    const targetAsteroid = new Asteroid({ x: 400, y: 300 }, 'Large');
    game.asteroids = [targetAsteroid];

    // Deactivate initial invulnerability to allow collision
    game.ship.isInvulnerable = false;

    // Set ship at center but with speed
    game.ship.velocity = { x: 100, y: 100 };

    game.checkCollisions();

    // Ship position is reset to center
    expect(game.ship.position).toEqual({ x: 400, y: 300 });
    // Velocity is reset to zero
    expect(game.ship.velocity).toEqual({ x: 0, y: 0 });
    // Ship is now invulnerable
    expect(game.ship.isInvulnerable).toBe(true);
  });

  test('should transition waves when all asteroids are cleared', () => {
    const game = new Game(800, 600);
    game.startNewGame();

    // Clear all asteroids
    game.asteroids = [];

    // First update registers clearance, starts timer
    game.update(1.0);
    expect(game.waveTransitionActive).toBe(true);
    expect(game.waveTransitionTimer).toBe(1.5); // 2.5 - 1.0 = 1.5

    // Second update completes transition
    game.update(1.5);
    expect(game.waveTransitionActive).toBe(false);
    expect(game.wave).toBe(2);
    expect(game.asteroids.length).toBe(5); // 3 + 2 = 5 large asteroids
  });

  test('should trigger audio sounds on appropriate actions', () => {
    const game = new Game(800, 600);
    
    // Setup spies
    const playFireSpy = vi.spyOn(game.soundManager, 'playFire');
    const playExplosionSpy = vi.spyOn(game.soundManager, 'playExplosion');
    const playShipDeathSpy = vi.spyOn(game.soundManager, 'playShipDeath');
    const setThrustSpy = vi.spyOn(game.soundManager, 'setThrust');
    const startHeartbeatSpy = vi.spyOn(game.soundManager, 'startHeartbeat');
    const stopHeartbeatSpy = vi.spyOn(game.soundManager, 'stopHeartbeat');
    const updateHeartbeatCountSpy = vi.spyOn(game.soundManager, 'updateHeartbeatAsteroidsCount');

    // 1. startNewGame -> startHeartbeat & updateHeartbeatCount
    game.startNewGame();
    expect(startHeartbeatSpy).toHaveBeenCalled();
    expect(updateHeartbeatCountSpy).toHaveBeenCalledWith(game.asteroids.length);

    // 2. fireBullet -> playFire
    game.fireBullet();
    expect(playFireSpy).toHaveBeenCalled();

    // 3. checkCollisions (bullet-asteroid) -> playExplosion
    const targetAsteroid = new Asteroid({ x: 200, y: 200 }, 'Large');
    const bullet = new Bullet(200, 200, 0, 0);
    game.asteroids = [targetAsteroid];
    game.bullets = [bullet];
    game.checkCollisions();
    expect(playExplosionSpy).toHaveBeenCalledWith('large');

    // 4. checkCollisions (ship-asteroid) -> playShipDeath
    const targetAsteroid2 = new Asteroid({ x: 400, y: 300 }, 'Large');
    game.asteroids = [targetAsteroid2];
    game.ship.isInvulnerable = false;
    game.checkCollisions();
    expect(playShipDeathSpy).toHaveBeenCalled();

    // 5. update (thrust active) -> setThrust
    game.state = 'PLAYING';
    game.keysPressed['w'] = true;
    game.update(0.1);
    expect(setThrustSpy).toHaveBeenCalledWith(true);

    // 6. update (thrust inactive) -> setThrust(false)
    game.keysPressed['w'] = false;
    game.update(0.1);
    expect(setThrustSpy).toHaveBeenCalledWith(false);

    // 7. update (transition active) -> stopHeartbeat
    game.asteroids = [];
    game.update(0.1); // Registers transition active at end of frame
    game.update(0.1); // Transition is now active, stops heartbeat
    expect(stopHeartbeatSpy).toHaveBeenCalled();
  });

  test('should toggle mute state and write to localStorage when M key is handled', () => {
    let keydownCallback: ((e: any) => void) | null = null;
    const originalWindow = (globalThis as any).window;
    
    const mockWindow = {
      addEventListener: vi.fn().mockImplementation((event, callback) => {
        if (event === 'keydown') {
          keydownCallback = callback;
        }
      })
    };
    (globalThis as any).window = mockWindow;

    const store: Record<string, string> = {};
    const originalLocalStorage = (globalThis as any).localStorage;
    (globalThis as any).localStorage = {
      getItem: vi.fn().mockImplementation((key: string) => store[key] || null),
      setItem: vi.fn().mockImplementation((key: string, value: string) => {
        store[key] = String(value);
      }),
      clear: vi.fn().mockImplementation(() => {
        for (const key in store) {
          delete store[key];
        }
      })
    } as any;

    const game = new Game(800, 600);
    game.setupInput();

    expect(keydownCallback).toBeDefined();
    expect(game.soundManager.isMuted).toBe(false);

    // Simulate pressing M key
    if (keydownCallback) {
      const mockEvent = {
        key: 'm',
        preventDefault: vi.fn()
      };
      (keydownCallback as any)(mockEvent);
    }

    expect(game.soundManager.isMuted).toBe(true);
    expect(globalThis.localStorage.getItem('asteroids_sound_muted')).toBe('true');

    // Toggle again
    if (keydownCallback) {
      const mockEvent = {
        key: 'm',
        preventDefault: vi.fn()
      };
      (keydownCallback as any)(mockEvent);
    }

    expect(game.soundManager.isMuted).toBe(false);
    expect(globalThis.localStorage.getItem('asteroids_sound_muted')).toBe('false');

    // Clean up
    (globalThis as any).window = originalWindow;
    (globalThis as any).localStorage = originalLocalStorage;
  });

  test('should render updated Option C control instruction strings on title screen', () => {
    const game = new Game(800, 600);
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      fillRect: vi.fn(),
      clearRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    game.drawMenu(mockCtx);

    expect(mockCtx.fillText).toHaveBeenCalledWith('WASD OR ARROW KEYS TO MOVE', expect.any(Number), expect.any(Number));
    expect(mockCtx.fillText).toHaveBeenCalledWith('SPACE = SHOOT | S/DOWN = HYPERSPACE', expect.any(Number), expect.any(Number));
  });

  test('should handle continuous inputs from arrow keys', () => {
    const game = new Game(800, 600);
    game.startNewGame();

    const setThrustSpy = vi.spyOn(game.soundManager, 'setThrust');
    const rotateSpy = vi.spyOn(game.ship, 'rotate');

    // 1. Thrust with ArrowUp
    game.keysPressed['arrowup'] = true;
    game.update(0.1);
    expect(game.ship.thrusting).toBe(true);
    expect(setThrustSpy).toHaveBeenLastCalledWith(true);

    // 2. Clear thrust
    game.keysPressed['arrowup'] = false;
    game.update(0.1);
    expect(game.ship.thrusting).toBe(false);
    expect(setThrustSpy).toHaveBeenLastCalledWith(false);

    // 3. Rotate left with ArrowLeft
    game.keysPressed['arrowleft'] = true;
    game.update(0.1);
    expect(rotateSpy).toHaveBeenCalledWith('left', 0.1);

    // 4. Rotate right with ArrowRight
    rotateSpy.mockClear();
    game.keysPressed['arrowleft'] = false;
    game.keysPressed['arrowright'] = true;
    game.update(0.1);
    expect(rotateSpy).toHaveBeenCalledWith('right', 0.1);
  });

  test('should safeguard against acceleration doubling and opposing steering inputs', () => {
    const game = new Game(800, 600);
    game.startNewGame();

    // 1. Double thrust check
    game.keysPressed['w'] = true;
    game.keysPressed['arrowup'] = true;
    game.update(0.1);
    expect(game.ship.thrusting).toBe(true); // Should still be binary (true/false)

    // 2. Steer cancellation: left ('a') + right ('arrowright')
    const rotateSpy = vi.spyOn(game.ship, 'rotate');
    game.keysPressed['a'] = true;
    game.keysPressed['arrowright'] = true;
    game.update(0.1);
    expect(rotateSpy).not.toHaveBeenCalled();

    // 3. Steer cancellation: left ('arrowleft') + right ('d')
    rotateSpy.mockClear();
    game.keysPressed['a'] = false;
    game.keysPressed['arrowright'] = false;
    game.keysPressed['arrowleft'] = true;
    game.keysPressed['d'] = true;
    game.update(0.1);
    expect(rotateSpy).not.toHaveBeenCalled();

    // 4. Steer cancellation: left ('arrowleft') + right ('arrowright')
    rotateSpy.mockClear();
    game.keysPressed['d'] = false;
    game.keysPressed['arrowleft'] = true;
    game.keysPressed['arrowright'] = true;
    game.update(0.1);
    expect(rotateSpy).not.toHaveBeenCalled();

    // 5. Steer cancellation: left ('a') + right ('d')
    rotateSpy.mockClear();
    game.keysPressed['arrowleft'] = false;
    game.keysPressed['arrowright'] = false;
    game.keysPressed['a'] = true;
    game.keysPressed['d'] = true;
    game.update(0.1);
    expect(rotateSpy).not.toHaveBeenCalled();
  });

  test('should handle browser default prevention and single-trigger inputs', () => {
    let keydownCallback: ((e: any) => void) | null = null;
    let keyupCallback: ((e: any) => void) | null = null;
    const originalWindow = (globalThis as any).window;
    
    const mockWindow = {
      addEventListener: vi.fn().mockImplementation((event, callback) => {
        if (event === 'keydown') {
          keydownCallback = callback;
        } else if (event === 'keyup') {
          keyupCallback = callback;
        }
      })
    };
    (globalThis as any).window = mockWindow;

    const game = new Game(800, 600);
    game.setupInput();

    expect(keydownCallback).toBeDefined();
    expect(keyupCallback).toBeDefined();

    // 1. Prevent default behavior for arrow keys
    const preventDefaultSpy = vi.fn();
    keydownCallback!({ key: 'ArrowUp', preventDefault: preventDefaultSpy });
    expect(preventDefaultSpy).toHaveBeenCalled();

    preventDefaultSpy.mockClear();
    keydownCallback!({ key: 'ArrowDown', preventDefault: preventDefaultSpy });
    expect(preventDefaultSpy).toHaveBeenCalled();

    preventDefaultSpy.mockClear();
    keydownCallback!({ key: 'ArrowLeft', preventDefault: preventDefaultSpy });
    expect(preventDefaultSpy).toHaveBeenCalled();

    preventDefaultSpy.mockClear();
    keydownCallback!({ key: 'ArrowRight', preventDefault: preventDefaultSpy });
    expect(preventDefaultSpy).toHaveBeenCalled();

    // 2. Single trigger hyperspace check for ArrowDown
    game.state = 'PLAYING';
    game.keysPressed = {};
    const hyperspaceSpy = vi.spyOn(game.ship, 'hyperspace');
    const playHyperspaceSpy = vi.spyOn(game.soundManager, 'playHyperspace');

    // Simulate keydown arrowdown
    keydownCallback!({ key: 'ArrowDown', preventDefault: vi.fn() });
    expect(hyperspaceSpy).toHaveBeenCalledTimes(1);
    expect(playHyperspaceSpy).toHaveBeenCalledTimes(1);

    // Simulate held key (multiple keydowns without keyup)
    hyperspaceSpy.mockClear();
    playHyperspaceSpy.mockClear();
    keydownCallback!({ key: 'ArrowDown', preventDefault: vi.fn() });
    expect(hyperspaceSpy).not.toHaveBeenCalled();
    expect(playHyperspaceSpy).not.toHaveBeenCalled();

    // Simulate pressing S while Down Arrow is still held
    keydownCallback!({ key: 's', preventDefault: vi.fn() });
    expect(hyperspaceSpy).not.toHaveBeenCalled();
    expect(playHyperspaceSpy).not.toHaveBeenCalled();

    // Simulate keyup ArrowDown and keyup S, then press S
    keyupCallback!({ key: 'ArrowDown' });
    keyupCallback!({ key: 's' });
    keydownCallback!({ key: 's', preventDefault: vi.fn() });
    expect(hyperspaceSpy).toHaveBeenCalledTimes(1);

    // Clean up
    (globalThis as any).window = originalWindow;
  });

  test('should initialize bulletFireCooldown to 0', () => {
    const game = new Game(800, 600);
    expect(game.bulletFireCooldown).toBe(0);
    game.startNewGame();
    expect(game.bulletFireCooldown).toBe(0);
  });

  test('should fire first shot instantly and set cooldown on keydown', () => {
    let keydownCallback: ((e: any) => void) | null = null;
    const originalWindow = (globalThis as any).window;
    
    const mockWindow = {
      addEventListener: vi.fn().mockImplementation((event, callback) => {
        if (event === 'keydown') {
          keydownCallback = callback;
        }
      })
    };
    (globalThis as any).window = mockWindow;

    const game = new Game(800, 600);
    game.setupInput();
    game.startNewGame();
    
    expect(game.bullets.length).toBe(0);
    expect(game.bulletFireCooldown).toBe(0);

    // Press Spacebar
    keydownCallback!({ key: ' ', preventDefault: vi.fn() });
    expect(game.bullets.length).toBe(1);
    expect(game.bulletFireCooldown).toBe(0.2);

    // Simulate held key repeat (another keydown event without keyup)
    keydownCallback!({ key: ' ', preventDefault: vi.fn() });
    expect(game.bullets.length).toBe(1); // No additional bullet

    (globalThis as any).window = originalWindow;
  });

  test('should handle continuous firing cooldown timing and automatic shots', () => {
    const game = new Game(800, 600);
    game.startNewGame();
    
    // Simulate spacebar key pressed down
    game.keysPressed[' '] = true;
    game.bulletFireCooldown = 0.2; // First shot already set it to 0.2
    
    // Update by 0.1 seconds
    game.update(0.1);
    expect(game.bulletFireCooldown).toBeCloseTo(0.1);
    expect(game.bullets.length).toBe(0); // Cooldown still active, no bullet fired
    
    // Update by another 0.1 seconds (cooldown should reach <= 0 and fire)
    game.update(0.1);
    expect(game.bullets.length).toBe(1); // Fired 2nd bullet automatically
    expect(game.bulletFireCooldown).toBeCloseTo(0.2); // Reset to 0.2
  });

  test('should instantly reset cooldown to 0 on keyup of Spacebar', () => {
    let keyupCallback: ((e: any) => void) | null = null;
    const originalWindow = (globalThis as any).window;
    
    const mockWindow = {
      addEventListener: vi.fn().mockImplementation((event, callback) => {
        if (event === 'keyup') {
          keyupCallback = callback;
        }
      })
    };
    (globalThis as any).window = mockWindow;

    const game = new Game(800, 600);
    game.setupInput();
    game.startNewGame();
    
    game.bulletFireCooldown = 0.2;
    
    // Release Spacebar
    keyupCallback!({ key: ' ' });
    expect(game.bulletFireCooldown).toBe(0);

    (globalThis as any).window = originalWindow;
  });

  test('should support rapid manual tap-firing bypassing the 200ms cooldown', () => {
    let keydownCallback: ((e: any) => void) | null = null;
    let keyupCallback: ((e: any) => void) | null = null;
    const originalWindow = (globalThis as any).window;
    
    const mockWindow = {
      addEventListener: vi.fn().mockImplementation((event, callback) => {
        if (event === 'keydown') {
          keydownCallback = callback;
        } else if (event === 'keyup') {
          keyupCallback = callback;
        }
      })
    };
    (globalThis as any).window = mockWindow;

    const game = new Game(800, 600);
    game.setupInput();
    game.startNewGame();

    // Tap 1: Press
    keydownCallback!({ key: ' ', preventDefault: vi.fn() });
    expect(game.bullets.length).toBe(1);
    expect(game.bulletFireCooldown).toBe(0.2);

    // Tap 1: Release
    keyupCallback!({ key: ' ' });
    expect(game.bulletFireCooldown).toBe(0);

    // Tap 2: Press immediately (no game loop ticks in between)
    keydownCallback!({ key: ' ', preventDefault: vi.fn() });
    expect(game.bullets.length).toBe(2);
    expect(game.bulletFireCooldown).toBe(0.2);

    // Tap 2: Release
    keyupCallback!({ key: ' ' });
    expect(game.bulletFireCooldown).toBe(0);

    (globalThis as any).window = originalWindow;
  });

  test('should continuous-poll and fire immediately once bullet limit permits', () => {
    const game = new Game(800, 600);
    game.startNewGame();
    
    // Fill the bullets array with 6 active bullets
    for (let i = 0; i < 6; i++) {
      game.bullets.push(game.ship.shoot());
    }
    expect(game.bullets.length).toBe(6);
    
    // Set spacebar held down and set cooldown to 0 (ready to fire but limited)
    game.keysPressed[' '] = true;
    game.bulletFireCooldown = 0;
    
    // Update the game. It shouldn't fire a 7th bullet, and cooldown should remain <= 0 (continuous polling)
    game.update(0.1);
    expect(game.bullets.length).toBe(6);
    expect(game.bulletFireCooldown).toBeLessThanOrEqual(0);
    
    // Deactivate one bullet and manually filter it from game bullets
    game.bullets[0].active = false;
    game.bullets = game.bullets.filter(b => b.active);
    
    // Trigger the update frame (which updates/filters bullets, then checks continuous firing)
    game.update(0.016);
    
    // Bullet count should still be 6 because the inactive one was filtered and a new one was fired
    expect(game.bullets.length).toBe(6);
    expect(game.bullets.filter(b => b.active).length).toBe(6);
    expect(game.bulletFireCooldown).toBe(0.2);
  });
});
