# Step 1: Update UI Text and Title Rendering

## Goal
Update the browser page title and the game's title screen drawing routine to display "asteroids tribute" in lowercase retro vector-style font. "Done" means that when launching the game in the browser, the page tab displays "asteroids tribute", and the game's menu screen displays "asteroids tribute" instead of the uppercase "ASTEROIDS".

## Context
This is a focused branding and UI text update to establish the retro tribute identity of our game while respecting intellectual property boundaries. The change will be implemented purely within the index.html page metadata and the canvas rendering code in src/game.ts, without changing any game state or physics loop logic.

## Files to Edit/Create
- `index.html` (Edit)
- `src/game.ts` (Edit)

## Proposed Logic & Implementation Details
1. **HTML Document Title**:
   - Locate the `<title>` tag inside `index.html` (line 6).
   - Change the text from `Retro Asteroids` to `asteroids tribute` (all lowercase to fit retro aesthetics).

2. **Game Title Screen Rendering**:
   - Locate the `drawMenu` method inside `src/game.ts` (specifically line 211).
   - In the canvas drawing operations, locate the `fillText` instruction for the game title:
     ```typescript
     ctx.fillText('ASTEROIDS', this.width / 2, this.height / 2 - 80);
     ```
   - Change the text payload from `'ASTEROIDS'` to `'asteroids tribute'` to draw the correct tribute title on the screen.
   - Ensure the styling, font, and canvas alignment remain unchanged (bold 64px Courier New/monospaced centered text with glowing shadow blur effects).

## Verification & Tests
1. **Local Server Verification**:
   - Start the Vite development server using:
     ```bash
     npm run dev
     ```
   - Open the displayed localhost URL in a web browser.
2. **UI Verification**:
   - Verify that the browser tab's document title reads exactly `"asteroids tribute"`.
   - Verify that the main title screen renders `"asteroids tribute"` in lowercase.
   - Verify that other title screen texts (e.g., control instructions) still render and function as expected.
3. **Build and Quality Checks**:
   - Run type checking and production build to ensure no errors were introduced:
     ```bash
     npm run build
     ```
   - Run existing test suites to ensure zero regressions:
     ```bash
     npm run test
     ```
