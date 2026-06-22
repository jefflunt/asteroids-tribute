import { describe, test, expect, vi } from 'vitest';
import { Ship } from './ship';

describe('Ship Entity', () => {
  test('should initialize with correct properties', () => {
    const ship = new Ship(100, 200);
    expect(ship.position).toEqual({ x: 100, y: 200 });
    expect(ship.velocity).toEqual({ x: 0, y: 0 });
    expect(ship.angle).toBeCloseTo(-Math.PI / 2);
    expect(ship.radius).toBe(12);
    expect(ship.thrusting).toBe(false);
    expect(ship.isInvulnerable).toBe(false);
  });

  test('should rotate left and right correctly', () => {
    const ship = new Ship(400, 300);
    const initialAngle = ship.angle;
    
    ship.rotate('right', 1); // Rotates right
    expect(ship.angle).toBeGreaterThan(initialAngle);

    ship.rotate('left', 1); // Rotates left
    expect(ship.angle).toBeCloseTo(initialAngle);
  });

  test('should update position based on velocity', () => {
    const ship = new Ship(400, 300);
    ship.velocity = { x: 100, y: 50 };
    ship.update(1, 800, 600); // 1 second
    // With 0.985 drag factor, velocity is reduced. Let's verify position has changed
    expect(ship.position.x).not.toBe(400);
    expect(ship.position.y).not.toBe(300);
  });

  test('should apply thrust when thrusting is true', () => {
    const ship = new Ship(400, 300);
    ship.thrusting = true;
    ship.update(1, 800, 600); // 1 second
    // Velocity should not be zero anymore
    expect(ship.velocity.x).not.toBe(0);
    expect(ship.velocity.y).not.toBe(0);
  });

  test('should trigger invulnerability and decay it over updates', () => {
    const ship = new Ship(400, 300);
    ship.triggerInvulnerability(3.0);
    expect(ship.isInvulnerable).toBe(true);
    expect(ship.invulnerableTimeRemaining).toBe(3.0);

    ship.update(1.0, 800, 600);
    expect(ship.isInvulnerable).toBe(true);
    expect(ship.invulnerableTimeRemaining).toBe(2.0);

    ship.update(2.5, 800, 600);
    expect(ship.isInvulnerable).toBe(false);
    expect(ship.invulnerableTimeRemaining).toBe(0);
  });

  test('should jump to random coordinates and clear velocity in hyperspace', () => {
    const ship = new Ship(400, 300);
    ship.velocity = { x: 50, y: 50 };
    
    // Mock Math.random to return predictable values for coordinates
    const originalRandom = Math.random;
    Math.random = vi.fn().mockReturnValue(0.5);

    ship.hyperspace(800, 600);
    expect(ship.position).toEqual({ x: 400, y: 300 });
    expect(ship.velocity).toEqual({ x: 0, y: 0 });
    expect(ship.isInvulnerable).toBe(true);

    // Restore random
    Math.random = originalRandom;
  });
});
