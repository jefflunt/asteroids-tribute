import { describe, test, expect } from 'vitest';
import { Bullet } from './bullet';
import { Ship } from './ship';

describe('Bullet Entity', () => {
  test('should initialize with correct properties and direction', () => {
    const bullet = new Bullet(100, 100, 0, 500); // Angle 0 pointing right
    expect(bullet.position).toEqual({ x: 100, y: 100 });
    expect(bullet.velocity.x).toBeCloseTo(500);
    expect(bullet.velocity.y).toBeCloseTo(0);
    expect(bullet.active).toBe(true);
    expect(bullet.radius).toBe(1.5);
  });

  test('should move based on velocity and update life remaining', () => {
    const bullet = new Bullet(100, 100, 0, 500);
    bullet.update(0.1, 800, 600); // 0.1s
    expect(bullet.position.x).toBeCloseTo(150); // 100 + 500 * 0.1
    expect(bullet.position.y).toBeCloseTo(100);
    expect(bullet.lifeRemaining).toBeCloseTo(1.1); // 1.2 - 0.1
  });

  test('should deactivate when life expires', () => {
    const bullet = new Bullet(100, 100, 0, 500);
    bullet.update(1.2, 800, 600); // 1.2s
    expect(bullet.active).toBe(false);
  });

  test('should wrap around screen boundaries', () => {
    // Bullet moving right at 500px/s starting near right edge
    const bullet = new Bullet(790, 300, 0, 500);
    bullet.update(0.1, 800, 600); // Travels 50px -> pos.x would be 840 -> wraps to 40
    expect(bullet.position.x).toBeCloseTo(40);
  });

  test('should be fired correctly from the ship nose tip', () => {
    const ship = new Ship(400, 300);
    ship.angle = 0; // Pointing right
    ship.radius = 12;

    const bullet = ship.shoot();
    // Bullet should spawn at ship nose tip (400 + 12 = 412, 300)
    expect(bullet.position.x).toBeCloseTo(412);
    expect(bullet.position.y).toBeCloseTo(300);
    // Bullet velocity should be in ship's angle direction
    expect(bullet.velocity.x).toBeGreaterThan(0);
    expect(bullet.velocity.y).toBeCloseTo(0);
  });
});
