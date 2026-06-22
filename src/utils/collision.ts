import { Vector2D } from './physics';

/**
 * Checks if two circles overlap (using distance squared for speed).
 */
export function checkCircleCollision(
  p1: Vector2D,
  r1: number,
  p2: Vector2D,
  r2: number
): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distSq = dx * dx + dy * dy;
  const radiiSum = r1 + r2;
  const radiiSumSq = radiiSum * radiiSum;

  return distSq < radiiSumSq;
}

/**
 * Checks if a point lies inside a circle.
 */
export function checkPointCircleCollision(
  point: Vector2D,
  circleCenter: Vector2D,
  radius: number
): boolean {
  return checkCircleCollision(point, 0, circleCenter, radius);
}
