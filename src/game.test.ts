import { describe, test, expect } from 'vitest';
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
});
