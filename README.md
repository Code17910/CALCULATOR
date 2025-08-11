# Meme Royale

Turn-based meme battle — modular web app version.

## Run locally

- Option A: Open `meme-royale/index.html` in your browser (no build step needed).
- Option B: Serve the folder with any static server:

```bash
npx http-server ./meme-royale -c-1
```

Then open the printed URL in your browser.

## Features

- Deck builder (pick 6 cards)
- Damage, heals, and status effects (Shield, Burn, Regen, Stun)
- Cooldowns per card
- Combo multiplier on consecutive hits
- Difficulty and settings (sound on/off, CPU vs CPU autoplay)
- Accessibility (keyboard, ARIA), responsive UI, reduced motion support
- Local storage for settings

## Structure

- `index.html` — App shell
- `styles.css` — Visual styles
- `src/` — JS modules (game logic, UI, audio)