# Step 2: Update Title Screen Instructions

## Goal
Modify the `drawMenu` method in `src/game.ts` to update the displayed controls text on the title screen to use the clean, sleek Option C presentation style:
```text
WASD OR ARROW KEYS TO MOVE
SPACE = SHOOT | S/DOWN = HYPERSPACE
```

## Context
The controls text is drawn inside the `drawMenu(ctx)` method in `src/game.ts`. The updated layout needs to align beautifully within the canvas viewport and replace the old WASD-only instruction lines.

## Files to Edit/Create
- `src/game.ts` (Edit)

## Proposed Logic & Implementation Details
1. **Locate Controls Description inside `drawMenu`**:
   - Locate the lines rendering the controls description text:
     ```typescript
     ctx.fillText('CONTROLS:', this.width / 2, this.height / 2 + 100);
     ctx.fillText('W = ACCELERATE | A/D = ROTATE', this.width / 2, this.height / 2 + 130);
     ctx.fillText('SPACE = SHOOT | S = HYPERSPACE JUMP', this.width / 2, this.height / 2 + 150);
     ```

2. **Replace lines with Option C wording**:
   - Replace the obsolete instructions with the new, cohesive Option C description:
     ```typescript
     ctx.fillText('CONTROLS:', this.width / 2, this.height / 2 + 100);
     ctx.fillText('WASD OR ARROW KEYS TO MOVE', this.width / 2, this.height / 2 + 130);
     ctx.fillText('SPACE = SHOOT | S/DOWN = HYPERSPACE', this.width / 2, this.height / 2 + 150);
     ```

3. **Check coordinates and alignment**:
   - Ensure these lines retain their exact vertical spacing (`+100`, `+130`, `+150`) and center alignment so they render cleanly within the fixed canvas bounds without overlapping adjacent text elements.

## Verification & Tests
1. Verify compilation using TypeScript:
   ```bash
   npx tsc --noEmit
   ```
2. Manually verify alignment of menu text or run standard tests. (Step 3 will write automated unit tests covering menu instructions changes).
