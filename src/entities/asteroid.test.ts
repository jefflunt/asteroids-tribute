import { describe, test, expect } from 'vitest';
import { Asteroid, spawnAsteroidWave } from './asteroid';

describe('Asteroid Entity', () => {
  test('should initialize with correct size properties', () => {
    const parentPos = { x: 100, y: 100 };
    
    const large = new Asteroid(parentPos, 'Large');
    expect(large.radius).toBe(40);
    expect(large.scoreValue).toBe(50);
    expect(large.offsets.length).toBe(10);

    const medium = new Asteroid(parentPos, 'Medium');
    expect(medium.radius).toBe(20);
    expect(medium.scoreValue).toBe(75);

    const small = new Asteroid(parentPos, 'Small');
    expect(small.radius).toBe(10);
    expect(small.scoreValue).toBe(100);
  });

  test('should move and wrap correctly during updates', () => {
    const startPos = { x: 790, y: 300 };
    const velocity = { x: 200, y: 0 };
    const asteroid = new Asteroid(startPos, 'Large', velocity);

    asteroid.update(0.1, 800, 600); // 10px movement to 810 -> wraps to 10
    expect(asteroid.position.x).toBeCloseTo(10);
  });

  test('should split correctly into smaller pieces', () => {
    const parentPos = { x: 200, y: 200 };
    const large = new Asteroid(parentPos, 'Large');
    
    const largeSplits = large.split();
    expect(largeSplits.length).toBe(2);
    expect(largeSplits[0].size).toBe('Medium');
    expect(largeSplits[1].size).toBe('Medium');
    expect(largeSplits[0].position).toEqual(parentPos);

    const medium = largeSplits[0];
    const mediumSplits = medium.split();
    expect(mediumSplits.length).toBe(2);
    expect(mediumSplits[0].size).toBe('Small');
    expect(mediumSplits[1].size).toBe('Small');
    expect(mediumSplits[0].position).toEqual(parentPos);

    const small = mediumSplits[0];
    const smallSplits = small.split();
    expect(smallSplits.length).toBe(0); // Small disappears
  });

  test('should spawn asteroid waves safely away from the ship position', () => {
    const shipPos = { x: 400, y: 300 };
    const wave = spawnAsteroidWave(10, 800, 600, shipPos, 150);
    
    expect(wave.length).toBe(10);
    wave.forEach(asteroid => {
      expect(asteroid.size).toBe('Large');
      
      const dx = asteroid.position.x - shipPos.x;
      const dy = asteroid.position.y - shipPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      expect(dist).toBeGreaterThanOrEqual(150);
    });
  });
});
