# Step 2: Create Rendering & Physics Standards Pattern

## Goal
Create `agent_docs/02_patterns/rendering_and_physics_standards.md` to document implementation standards for rendering and physics, matching the `pattern_template.md` format.

## Details
1. **Context**: Why frame-independent rendering and screen wrapping are critical for smooth 2D gameplay.
2. **Standards**:
   - **Delta Time**: All movement calculations must be multiplied by `deltaTime` (in seconds) to remain speed-consistent regardless of the screen's refresh rate.
   - **2D Vector Math**: Entities must track speed, coordinates, and acceleration using explicit `Vector2D` interface structures `{ x, y }`.
   - **Screen Wrapping**: Coordinates that drift beyond canvas width/height must immediately wrap around the boundaries using the `wrapPosition` utility.
   - **Speed Clamping**: Maximum velocity must be checked and clamped via the `limitSpeed` utility.
   - **Friction & Drag**: Velocity decay must be calculated using deltaTime-adjusted exponential drag (`applyDrag` function).
3. **Why**: Explain why we use continuous analytical wrapping and speed limits to avoid physics glitches (like ship flying off at lightspeed).
4. **Examples**: Show real TypeScript code snippets from `src/utils/physics.ts` or entity implementations to make it extremely practical.

## Checklist
- [ ] Create the directory `agent_docs/02_patterns/` if it does not exist.
- [ ] Create the pattern file `rendering_and_physics_standards.md` under `agent_docs/02_patterns/`.
- [ ] Verify that it strictly aligns with `templates/pattern_template.md`.
- [ ] Ensure the file rendering is clean and visually appealing.
