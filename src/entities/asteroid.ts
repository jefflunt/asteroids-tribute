import { Vector2D, wrapPosition } from '../utils/physics';

export type AsteroidSize = 'Large' | 'Medium' | 'Small';

export class Asteroid {
  position: Vector2D;
  velocity: Vector2D;
  size: AsteroidSize;
  radius: number;
  scoreValue: number;
  offsets: number[];

  constructor(position: Vector2D, size: AsteroidSize, velocity?: Vector2D) {
    this.position = { ...position };
    this.size = size;

    // Define size-specific characteristics
    let speedMin = 30;
    let speedMax = 60;

    switch (size) {
      case 'Large':
        this.radius = 40;
        this.scoreValue = 50;
        speedMin = 30;
        speedMax = 60;
        break;
      case 'Medium':
        this.radius = 20;
        this.scoreValue = 75;
        speedMin = 50;
        speedMax = 100;
        break;
      case 'Small':
        this.radius = 10;
        this.scoreValue = 100;
        speedMin = 80;
        speedMax = 150;
        break;
    }

    // Set or generate velocity
    if (velocity) {
      this.velocity = { ...velocity };
    } else {
      const angle = Math.random() * Math.PI * 2;
      const speed = speedMin + Math.random() * (speedMax - speedMin);
      this.velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      };
    }

    // Pre-generate 10 irregular jagged offsets (-0.15 to 0.15) to prevent flickering
    this.offsets = [];
    const numVertices = 10;
    for (let i = 0; i < numVertices; i++) {
      this.offsets.push(Math.random() * 0.3 - 0.15);
    }
  }

  split(): Asteroid[] {
    if (this.size === 'Large') {
      // Return 2 new Medium asteroids with slightly faster velocities
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = angle1 + Math.PI + (Math.random() * 0.4 - 0.2); // Opposite directions with small spread

      const speed = 75; // Medium speed is 50-100
      const vel1 = { x: Math.cos(angle1) * speed, y: Math.sin(angle1) * speed };
      const vel2 = { x: Math.cos(angle2) * speed, y: Math.sin(angle2) * speed };

      return [
        new Asteroid(this.position, 'Medium', vel1),
        new Asteroid(this.position, 'Medium', vel2),
      ];
    } else if (this.size === 'Medium') {
      // Return 2 new Small asteroids
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = angle1 + Math.PI + (Math.random() * 0.4 - 0.2);

      const speed = 115; // Small speed is 80-150
      const vel1 = { x: Math.cos(angle1) * speed, y: Math.sin(angle1) * speed };
      const vel2 = { x: Math.cos(angle2) * speed, y: Math.sin(angle2) * speed };

      return [
        new Asteroid(this.position, 'Small', vel1),
        new Asteroid(this.position, 'Small', vel2),
      ];
    }

    // Small asteroids disappear completely on split
    return [];
  }

  update(deltaTime: number, width: number, height: number): void {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    this.position = wrapPosition(this.position, width, height);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();

    const verticesCount = this.offsets.length;
    for (let i = 0; i < verticesCount; i++) {
      const angle = (i / verticesCount) * Math.PI * 2;
      // Apply pre-generated radial jaggedness offset
      const currentRadius = this.radius * (1 + this.offsets[i]);
      const x = this.position.x + Math.cos(angle) * currentRadius;
      const y = this.position.y + Math.sin(angle) * currentRadius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Spawns a wave of large asteroids, ensuring they do not spawn close to the ship's center position.
 */
export function spawnAsteroidWave(
  count: number,
  width: number,
  height: number,
  shipPos: Vector2D,
  minSpawnDistance: number = 150
): Asteroid[] {
  const asteroids: Asteroid[] = [];

  while (asteroids.length < count) {
    const testPos = {
      x: Math.random() * width,
      y: Math.random() * height,
    };

    // Calculate distance from ship
    const dx = testPos.x - shipPos.x;
    const dy = testPos.y - shipPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Only spawn if safe distance threshold is met
    if (dist >= minSpawnDistance) {
      asteroids.push(new Asteroid(testPos, 'Large'));
    }
  }

  return asteroids;
}
