import { Ship } from './entities/ship';
import { Bullet } from './entities/bullet';
import { Asteroid, spawnAsteroidWave } from './entities/asteroid';
import { checkCircleCollision } from './utils/collision';

export type GameState = 'MENU' | 'PLAYING';

export class Game {
  state: GameState;
  score: number;
  wave: number;
  ship!: Ship;
  bullets: Bullet[];
  asteroids: Asteroid[];
  
  width: number;
  height: number;
  
  keysPressed: { [key: string]: boolean };
  tickCount: number;
  waveTransitionTimer: number;
  waveTransitionActive: boolean;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.state = 'MENU';
    this.score = 0;
    this.wave = 1;
    this.bullets = [];
    this.asteroids = [];
    this.keysPressed = {};
    this.tickCount = 0;
    this.waveTransitionTimer = 2.5; // Seconds between waves
    this.waveTransitionActive = false;
    
    this.resetEntities();
    this.setupInput();
  }

  resetEntities(): void {
    this.ship = new Ship(this.width / 2, this.height / 2);
    this.bullets = [];
    this.asteroids = [];
  }

  startNewGame(): void {
    this.state = 'PLAYING';
    this.score = 0;
    this.wave = 1;
    this.resetEntities();
    this.ship.triggerInvulnerability(3.0); // 3 seconds safe window
    this.spawnCurrentWave();
  }

  spawnCurrentWave(): void {
    // Wave 1: 4 asteroids, Wave 2: 5, Wave 3: 6, etc.
    const count = 3 + this.wave;
    this.asteroids = spawnAsteroidWave(count, this.width, this.height, this.ship.position, 150);
    this.waveTransitionActive = false;
    this.waveTransitionTimer = 2.5;
  }

  setupInput(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      
      // Prevent scrolling behaviors for game controls
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 's', 'w', 'a', 'd'].includes(e.key) || e.key === 'Enter') {
        e.preventDefault();
      }

      if (this.state === 'MENU' && e.key === 'Enter') {
        this.startNewGame();
        return;
      }

      // Single trigger actions (cannot hold down)
      if (this.state === 'PLAYING') {
        if (key === ' ' && !this.keysPressed[' ']) {
          this.fireBullet();
        }
        if (key === 's' && !this.keysPressed['s']) {
          this.ship.hyperspace(this.width, this.height);
        }
      }

      this.keysPressed[key] = true;
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      this.keysPressed[key] = false;
    });
  }

  fireBullet(): void {
    if (this.bullets.length < 6) {
      const bullet = this.ship.shoot();
      this.bullets.push(bullet);
    }
  }

  update(deltaTime: number): void {
    this.tickCount++;

    if (this.state !== 'PLAYING') return;

    // Handle ship continuous inputs
    this.ship.thrusting = !!this.keysPressed['w'];
    if (this.keysPressed['a']) {
      this.ship.rotate('left', deltaTime);
    }
    if (this.keysPressed['d']) {
      this.ship.rotate('right', deltaTime);
    }

    // Update ship
    this.ship.update(deltaTime, this.width, this.height);

    // Update bullets
    this.bullets.forEach((bullet) => bullet.update(deltaTime, this.width, this.height));
    this.bullets = this.bullets.filter((bullet) => bullet.active);

    // Update asteroids
    this.asteroids.forEach((asteroid) => asteroid.update(deltaTime, this.width, this.height));

    // Handle Collisions
    this.checkCollisions();

    // Check for Wave clearance
    if (this.asteroids.length === 0) {
      this.waveTransitionActive = true;
      this.waveTransitionTimer -= deltaTime;
      if (this.waveTransitionTimer <= 0) {
        this.wave++;
        this.spawnCurrentWave();
      }
    }
  }

  checkCollisions(): void {
    // 1. Bullet-Asteroid Collisions
    for (let b = this.bullets.length - 1; b >= 0; b--) {
      const bullet = this.bullets[b];
      for (let a = this.asteroids.length - 1; a >= 0; a--) {
        const asteroid = this.asteroids[a];

        if (checkCircleCollision(bullet.position, bullet.radius, asteroid.position, asteroid.radius)) {
          // Deactivate bullet
          bullet.active = false;
          
          // Split asteroid
          const newAsteroids = asteroid.split();
          this.asteroids.splice(a, 1); // Remove old asteroid
          this.asteroids.push(...newAsteroids);

          // Add score
          this.score += asteroid.scoreValue;
          
          // Filter inactive bullet and break inner loop to avoid double collision
          this.bullets.splice(b, 1);
          break;
        }
      }
    }

    // 2. Ship-Asteroid Collisions (Only if ship is NOT invulnerable)
    if (!this.ship.isInvulnerable) {
      for (let a = 0; a < this.asteroids.length; a++) {
        const asteroid = this.asteroids[a];
        if (checkCircleCollision(this.ship.position, this.ship.radius, asteroid.position, asteroid.radius)) {
          // Reset ship to center, reset velocity
          this.ship.position = { x: this.width / 2, y: this.height / 2 };
          this.ship.velocity = { x: 0, y: 0 };
          this.ship.angle = -Math.PI / 2;
          
          // Grant invulnerability
          this.ship.triggerInvulnerability(3.0);
          
          // Break to avoid multiple hits in one frame
          break;
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Clear screen with black color
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.state === 'MENU') {
      this.drawMenu(ctx);
    } else if (this.state === 'PLAYING') {
      this.drawGameplay(ctx);
    }
  }

  drawMenu(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';

    // Title
    ctx.font = "bold 64px 'Courier New', Courier, monospace";
    ctx.fillText('ASTEROIDS', this.width / 2, this.height / 2 - 80);

    // Prompt (Flashes every 500ms)
    if (Math.floor(this.tickCount / 30) % 2 === 0) {
      ctx.font = "20px 'Courier New', Courier, monospace";
      ctx.fillText('PRESS ENTER TO START', this.width / 2, this.height / 2 + 10);
    }

    // Controls description
    ctx.font = "14px 'Courier New', Courier, monospace";
    ctx.fillText('CONTROLS:', this.width / 2, this.height / 2 + 100);
    ctx.fillText('W = ACCELERATE | A/D = ROTATE', this.width / 2, this.height / 2 + 130);
    ctx.fillText('SPACE = SHOOT | S = HYPERSPACE JUMP', this.width / 2, this.height / 2 + 150);

    // Goal
    ctx.fillText('SHOOT ASTEROIDS & SURVIVE', this.width / 2, this.height / 2 + 200);

    ctx.restore();
  }

  drawGameplay(ctx: CanvasRenderingContext2D): void {
    // Draw all entities
    this.asteroids.forEach((asteroid) => asteroid.draw(ctx));
    this.bullets.forEach((bullet) => bullet.draw(ctx));
    this.ship.draw(ctx, this.tickCount);

    // Draw UI overlay
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffffff';
    ctx.font = "18px 'Courier New', Courier, monospace";

    // Format score with retro padded zeros (e.g., 00150)
    const formattedScore = String(this.score).padStart(5, '0');
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${formattedScore}`, 20, 30);

    ctx.textAlign = 'right';
    ctx.fillText(`WAVE ${this.wave}`, this.width - 20, 30);

    // If Wave clear transition is running
    if (this.waveTransitionActive) {
      ctx.textAlign = 'center';
      ctx.font = "24px 'Courier New', Courier, monospace";
      ctx.fillText('WAVE CLEAR!', this.width / 2, this.height / 2);
    }

    ctx.restore();
  }
}
