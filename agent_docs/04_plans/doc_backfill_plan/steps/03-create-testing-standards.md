# Step 3: Create Testing Standards Pattern

## Goal
Create `agent_docs/02_patterns/testing_standards.md` to establish testing conventions, matching the `pattern_template.md` format.

## Details
1. **Context**: Why 100% test coverage and robust unit tests are required for maintaining a stable game engine.
2. **Standards**:
   - **Vitest Framework**: Use Vitest as the core test runner.
   - **Test File Location**: Keep `.test.ts` files co-located next to their source files (e.g. `ship.test.ts` right next to `ship.ts`).
   - **Mocking Strategy**: How to mock the browser window, event listeners, canvas element, and context interfaces if needed.
   - **Deterministic Assertions**: Use strict assertions for mathematical physics (e.g. testing rotation offsets, bullet ranges, speed decay) using precise delta thresholds or exact matches.
   - **100% Coverage Target**: Any code change or addition must be followed by corresponding unit tests. Run `npm run test` before committing.
3. **Why**: Explain why close proximity of test files and complete unit test suites guarantee the codebase does not regress on visual or physical changes.
4. **Examples**: Provide real test patterns from `src/game.test.ts` or `src/utils/physics.test.ts` showing how to assert mock ticks or distance overlaps.

## Checklist
- [ ] Create the pattern file `testing_standards.md` under `agent_docs/02_patterns/`.
- [ ] Align the file content with the structure in `templates/pattern_template.md`.
- [ ] Check links and code formatting blocks.
