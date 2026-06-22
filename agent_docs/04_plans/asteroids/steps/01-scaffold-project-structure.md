# Step 1: Scaffold Project Structure

## Goal
Initialize a TypeScript-based web project using Vite, set up standard configuration files, and establish the main canvas container and basic stylesheet. "Done" means the development server runs successfully, and the browser renders a centered, black canvas.

## Context
This is the foundational step of the Asteroids game. It sets up the development environment, tooling, and entry points. No gameplay logic is written here, but the game canvas, HTML layout, and styled wrapper are initialized.

## Files to Edit/Create
- `package.json` (Create/Edit)
- `tsconfig.json` (Create)
- `index.html` (Create)
- `src/main.ts` (Create)
- `src/styles.css` (Create)

## Proposed Logic & Implementation Details
1. **Package Setup**:
   - Add `vite` and `typescript` as dependencies / devDependencies in `package.json`.
   - Configure npm scripts: `"dev": "vite"`, `"build": "tsc && vite build"`, `"preview": "vite preview"`.
2. **TypeScript Config (`tsconfig.json`)**:
   - Set compiler options for a browser environment (target: `ES2022`, module: `ESNext`, moduleResolution: `Node`, strict check: `true`, lib: `["DOM", "DOM.Iterable", "ES2022"]`).
3. **HTML Entry Point (`index.html`)**:
   - A single `<canvas>` element with `id="game-canvas"`.
   - Include `<script type="module" src="/src/main.ts"></script>`.
   - Set up standard structure with title "Retro Asteroids".
4. **Styles (`src/styles.css`)**:
   - Style the page to be retro: solid black background (`#000000`).
   - Center the canvas element horizontally and vertically using Flexbox or Grid.
   - Maintain a crisp look (e.g., canvas border of 1px thin white line to visualize the game boundaries).
   - Ensure a responsive layout (canvas max-width/max-height set to fit standard aspect ratios like 4:3 or 16:9, e.g., 800x600 size).
5. **Main Entry (`src/main.ts`)**:
   - Import `styles.css`.
   - Select the canvas element and get its 2D rendering context (`CanvasRenderingContext2D`).
   - Set the canvas's internal resolution (e.g., width = 800, height = 600) so that coordinates are stable.
   - Fill the canvas with solid black on load to confirm context initialization.

## Verification & Tests
1. Run `npm install` to install Vite and TypeScript.
2. Run `npm run dev` to start the development server.
3. Open the localhost URL in a browser and verify that:
   - The page has a black background.
   - There is a centered 800x600 canvas container outlined with a thin white border.
   - The developer console contains no errors or warnings.
