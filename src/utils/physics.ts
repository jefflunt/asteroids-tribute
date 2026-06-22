export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Wraps a position vector around screen boundaries of width and height.
 */
export function wrapPosition(pos: Vector2D, width: number, height: number): Vector2D {
  let x = pos.x;
  let y = pos.y;

  if (x < 0) {
    x += width;
  } else if (x > width) {
    x -= width;
  }

  if (y < 0) {
    y += height;
  } else if (y > height) {
    y -= height;
  }

  return { x, y };
}

/**
 * Applies exponential drag (friction) to velocity based on deltaTime.
 * dragFactor is typically between 0.0 and 1.0 (e.g. 0.99 per frame).
 * To make it independent of framerate, we raise to the power of (deltaTime * 60).
 */
export function applyDrag(velocity: Vector2D, dragFactor: number, deltaTime: number): Vector2D {
  const factor = Math.pow(dragFactor, deltaTime * 60);
  return {
    x: velocity.x * factor,
    y: velocity.y * factor
  };
}

/**
 * Limits speed (magnitude of velocity vector) to maxSpeed.
 */
export function limitSpeed(velocity: Vector2D, maxSpeed: number): Vector2D {
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  if (speed > maxSpeed && speed > 0) {
    return {
      x: (velocity.x / speed) * maxSpeed,
      y: (velocity.y / speed) * maxSpeed
    };
  }
  return { x: velocity.x, y: velocity.y };
}
