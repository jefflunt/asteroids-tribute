import './styles.css';
import { Game } from './game';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found!');
}

const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Could not get 2D context!');
}

// Fixed dimensions for gameplay coordinates
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Create the main game manager instance
const game = new Game(CANVAS_WIDTH, CANVAS_HEIGHT);

// Resume audio context on user click/tap as fallback for autoplay block
window.addEventListener('click', () => {
  game.soundManager.init();
});

let lastTime = performance.now();

function gameLoop(currentTime: number): void {
  // Calculate delta time in seconds
  let deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Cap deltaTime to avoid huge jumps on tab switching
  if (deltaTime > 0.1) {
    deltaTime = 0.1;
  }

  // Update and render the game state
  game.update(deltaTime);
  game.draw(ctx!);

  // Request next frame
  requestAnimationFrame(gameLoop);
}

// Start the loop
requestAnimationFrame((time) => {
  lastTime = time;
  requestAnimationFrame(gameLoop);
});

console.log('Retro Asteroids loop started successfully!');
