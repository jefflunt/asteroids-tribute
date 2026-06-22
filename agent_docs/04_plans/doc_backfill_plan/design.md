# Plan: DOC-BF-01 - Documentation Backfill Plan

## Goal
Establish a complete, high-quality, and AI-readable documentation structure in the `agent_docs/` folder. This backfill will align the Asteroids clone project with the official standards of Continuous Alignment and Progressive Disclosure, enabling future development squads and AI agents to quickly understand, navigate, and contribute to the repository.

## Scope
- **In Scope**:
  - Scaffolding standard directory structures: `agent_docs/01_orientation/`, `agent_docs/02_patterns/`, and `agent_docs/03_deep_dives/`.
  - Creating the Orientation Guide (`agent_docs/01_orientation/README.md`) summarizing the project's background, high-level features, tech stack, and codebase structure.
  - Formulating pattern documents in `agent_docs/02_patterns/` following the `pattern_template.md`:
    - `rendering_and_physics_standards.md` detailing frame-independent animation loops, 2D vector math, screen wrapping, and delta-time calculations.
    - `testing_standards.md` detailing Vitest integration, strict unit testing guidelines, and 100% coverage goals.
  - Drafting comprehensive deep-dive files in `agent_docs/03_deep_dives/` following the `deep_dive_template.md`:
    - `game_architecture_and_state.md` analyzing the central game engine, input event hooks, wave transitions, state machine transitions, and text/UI overlays.
    - `entities_and_collision_system.md` mapping out the core entity relationships (Ship, Bullet, Asteroid) and circle/point collision math.
- **Explicitly Out of Scope**:
  - Modifying any game logic source files in `src/`.
  - Modifying styles or index.html entrypoints.
  - Updating package dependencies or changing build targets.
  - Writing new feature planning documents.

## Implementation Steps
Use this as the state-tracking mechanism:
- Use `|` to mark subtasks as **Done**.
- Use `-` to mark subtasks as **Pending**.

- T001: Create Orientation Guide (`agent_docs/01_orientation/README.md`)
  - [|] Write background, target platform, and directory overview.
  - [|] Document strict guidelines for AI agents starting on the repo.
- T002: Create Design & Coding Patterns (`agent_docs/02_patterns/`)
  - [|] Write `rendering_and_physics_standards.md` outlining delta-time, speed clamping, drag, and wrapping.
  - [|] Write `testing_standards.md` outlining Vitest conventions and coverage benchmarks.
- T003: Create Subsystem Deep Dives (`agent_docs/03_deep_dives/`)
  - [|] Write `game_architecture_and_state.md` covering the main game loop, rendering state machine, and keyboard event bindings.
  - [|] Write `entities_and_collision_system.md` detailing Ship, Bullet, Asteroid mechanics, and collision math.

## Verification
- Verify that standard folders exist: `01_orientation/`, `02_patterns/`, `03_deep_dives/`, `04_plans/`.
- Ensure all backfilled files match their respective templates and patterns.
- Confirm all markdown file hyperlinks are valid and relative paths are correct.
- Ensure the documentation is fully complete and AI-ready for future development iterations.

## Risks/Dependencies
- **Outdated Docs**: Documentation risks going stale if game logic is modified in future PRs without updating relevant folders. Mitigated by strictly applying "Continuous Alignment" (updating plans and deep-dives first).
