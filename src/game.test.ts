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
});
