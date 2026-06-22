import { Vector2D, wrapPosition, applyDrag, limitSpeed } from '../utils/physics';
import { Bullet } from './bullet';

const ROTATION_SPEED = 4; // Radians per second
const THRUST_ACCEL = 350; // Pixels per second^2
const MAX_SPEED = 300; // Pixels per second
const DRAG_FACTOR = 0.985; // Exponential drag factor (friction)

export class Ship {
  position: Vector2D;
  velocity: Vector2D;
  angle: number; // in radians, pointing up by default (-Math.PI / 2)
  radius: number;
  thrusting: boolean;
  isInvulnerable: boolean;
  invulnerableTimeRemaining: number;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.angle = -Math.PI / 2;
    this.radius = 12;
    this.thrusting = false;
    this.isInvulnerable = false;
    this.invulnerableTimeRemaining = 0;
  }

  rotate(direction: 'left' | 'right', deltaTime: number): void {
    const dir = direction === 'left' ? -1 : 1;
    this.angle += dir * ROTATION_SPEED * deltaTime;
  }

  hyperspace(width: number, height: number): void {
    this.position = {
      x: Math.random() * width,
      y: Math.random() * height,
    };
    this.velocity = { x: 0, y: 0 };
    // Make invulnerable for 1.5 seconds upon hyperspace jump for fairness
    this.triggerInvulnerability(1.5);
  }

  triggerInvulnerability(duration: number = 3.0): void {
    this.isInvulnerable = true;
    this.invulnerableTimeRemaining = duration;
  }

  shoot(): Bullet {
    const noseX = this.position.x + Math.cos(this.angle) * this.radius;
    const noseY = this.position.y + Math.sin(this.angle) * this.radius;
    return new Bullet(noseX, noseY, this.angle);
  }

  update(deltaTime: number, width: number, height: number): void {
    if (this.thrusting) {
      this.velocity.x += Math.cos(this.angle) * THRUST_ACCEL * deltaTime;
      this.velocity.y += Math.sin(this.angle) * THRUST_ACCEL * deltaTime;
    }

    // Apply drag/friction
    this.velocity = applyDrag(this.velocity, DRAG_FACTOR, deltaTime);

    // Limit ship's maximum speed
    this.velocity = limitSpeed(this.velocity, MAX_SPEED);

    // Move ship
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Wrap around screen boundaries
    this.position = wrapPosition(this.position, width, height);

    // Update invulnerability duration
    if (this.isInvulnerable) {
      this.invulnerableTimeRemaining -= deltaTime;
      if (this.invulnerableTimeRemaining <= 0) {
        this.isInvulnerable = false;
        this.invulnerableTimeRemaining = 0;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, tickCount: number): void {
    // If invulnerable, flash the ship every alternate 150ms
    if (this.isInvulnerable && Math.floor(tickCount / 10) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();

    // Isosceles triangle relative to center & angle
    const noseX = this.position.x + Math.cos(this.angle) * this.radius;
    const noseY = this.position.y + Math.sin(this.angle) * this.radius;

    const angleLeft = this.angle + (140 * Math.PI) / 180;
    const rearLeftX = this.position.x + Math.cos(angleLeft) * this.radius;
    const rearLeftY = this.position.y + Math.sin(angleLeft) * this.radius;

    const angleRight = this.angle - (140 * Math.PI) / 180;
    const rearRightX = this.position.x + Math.cos(angleRight) * this.radius;
    const rearRightY = this.position.y + Math.sin(angleRight) * this.radius;

    ctx.moveTo(noseX, noseY);
    ctx.lineTo(rearLeftX, rearLeftY);
    ctx.lineTo(rearRightX, rearRightY);
    ctx.closePath();
    ctx.stroke();

    // Draw thruster flame if accelerating
    if (this.thrusting && Math.floor(tickCount / 5) % 2 === 0) {
      ctx.beginPath();

      // Flame apex (pointing opposite to angle)
      const flameLength = this.radius * 1.2;
      const flameApexX = this.position.x - Math.cos(this.angle) * flameLength;
      const flameApexY = this.position.y - Math.sin(this.angle) * flameLength;

      ctx.moveTo(rearLeftX, rearLeftY);
      ctx.lineTo(flameApexX, flameApexY);
      ctx.lineTo(rearRightX, rearRightY);
      ctx.stroke();
    }

    ctx.restore();
  }
}
