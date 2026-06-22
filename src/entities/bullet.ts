import { Vector2D, wrapPosition } from '../utils/physics';

const BULLET_LIFETIME = 1.2; // Seconds a bullet survives

export class Bullet {
  position: Vector2D;
  velocity: Vector2D;
  lifeRemaining: number;
  active: boolean;
  radius: number;

  constructor(x: number, y: number, angle: number, speed: number = 500) {
    this.position = { x, y };
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };
    this.lifeRemaining = BULLET_LIFETIME;
    this.active = true;
    this.radius = 1.5;
  }

  update(deltaTime: number, width: number, height: number): void {
    if (!this.active) return;

    this.lifeRemaining -= deltaTime;
    if (this.lifeRemaining <= 0) {
      this.active = false;
      return;
    }

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Bullets wrap around boundaries in classic Asteroids
    this.position = wrapPosition(this.position, width, height);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
