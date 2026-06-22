# Pattern: Testing Standards

## Context
A video game involves highly interconnected dynamic states, where a change to one sub-system (such as player ship controls, asteroid division, or collision loops) can easily introduce regressions that ruin gameplay or trigger compile failures. Maintaining a complete, reliable, and co-located unit test suite ensures that any modifications or refactoring on physics, entity behaviors, wave progression, and state logic can be done with total confidence.

---

## Standard
1. **Testing Framework**: [Vitest](https://vitest.dev/) must be used for writing and executing unit and integration tests.
2. **Co-location**: All test files must be co-located directly beside their respective source files (e.g., `src/game.test.ts` lives in the same folder as `src/game.ts`). They must follow the naming convention `<filename>.test.ts`.
3. **100% Code Coverage Target**: Every file containing domain/game logic must have full test suites validating standard pathways and edge cases. Any added feature or refactored logic must include updated test assertions.
4. **Deterministic Assertions**: For mathematical, floating-point, or frame-independent assertions (such as rotation increments or speed drag), do not use direct equality checking (`expect().toBe()`). Instead, use Vitest's `toBeCloseTo()` or threshold bounds checking (`toBeLessThan()` or `toBeGreaterThan()`) to bypass decimal precision differences:
   ```typescript
   expect(result.x).toBeCloseTo(99, 4);
   ```
5. **Robust Mocking**:
   - For classes interacting with browser APIs (like `window` or `document`), mock them or add safe checks inside the code (e.g., `if (typeof window === 'undefined') return;`).
   - Mock time increments (`deltaTime`) in tests to ensure deterministic calculations, avoiding dependence on real-world system clock speed.

---

## Why
Co-locating test files makes discovering, reading, and maintaining test coverage simple and self-evident. 

Deterministic math assertions are required because JS/TS float operations are subject to rounding errors; asserting `expect(position.x).toBe(1.00000000000004)` will flake on different platforms, while `expect(position.x).toBeCloseTo(1.0, 4)` is robust.

Using `vitest` provides a modern, fast, and native ES-module-compliant testing runner that runs inside Vite configurations out of the box with zero boilerplate.

---

## Examples

### 1. Mathematical Utility Assertions (`src/utils/physics.test.ts`)
This snippet demonstrates testing coordinate wrapping and floating point calculations using `toEqual` and `toBeCloseTo`:

```typescript
import { describe, test, expect } from 'vitest';
import { wrapPosition, applyDrag, limitSpeed, Vector2D } from './physics';

describe('Physics Utilities', () => {
  describe('wrapPosition', () => {
    const width = 800;
    const height = 600;

    test('should wrap negative X to the right side of the screen', () => {
      const pos: Vector2D = { x: -10, y: 300 };
      expect(wrapPosition(pos, width, height)).toEqual({ x: 790, y: 300 });
    });
  });

  describe('applyDrag', () => {
    test('should reduce velocity over time', () => {
      const velocity: Vector2D = { x: 100, y: 100 };
      const dragFactor = 0.99;
      const deltaTime = 1 / 60; // 1 frame
      const result = applyDrag(velocity, dragFactor, deltaTime);
      
      expect(result.x).toBeLessThan(100);
      expect(result.x).toBeCloseTo(99, 4);
    });
  });
});
```

### 2. State-Based Loop Integration Tests (`src/game.test.ts`)
This snippet shows how we assert state progressions and strict constraints (such as the 6 active bullet on-screen ceiling) inside our central coordinator test suite:

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { Game } from './game';

describe('Game Coordinator', () => {
  let game: Game;

  beforeEach(() => {
    // Scaffold game coordinator with mock width/height
    game = new Game(800, 600);
  });

  test('should initialize in MENU state', () => {
    expect(game.state).toBe('MENU');
    expect(game.score).toBe(0);
    expect(game.wave).toBe(1);
  });

  test('should transition to PLAYING state and spawn first wave on start', () => {
    game.startNewGame();
    expect(game.state).toBe('PLAYING');
    expect(game.asteroids.length).toBe(4); // Wave 1 has 4 asteroids (3 + wave)
  });

  test('should limit active on-screen bullets to exactly 6', () => {
    game.startNewGame();
    
    // Attempt to fire 10 bullets
    for (let i = 0; i < 10; i++) {
      game.fireBullet();
    }

    // Assert bullet array size does not exceed the limit
    expect(game.bullets.length).toBe(6);
  });
});
```
