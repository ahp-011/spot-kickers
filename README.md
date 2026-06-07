# ⚽ Spot Kickers — Penalty Shootout

A bright, juicy browser penalty game. Pick your World Cup 2026 nation, **swipe to aim and curve your shot**, and beat the keeper. Built with **plain HTML5 Canvas + vanilla JS** — no frameworks, no backend, no build step, no paid services. It deploys as static files anywhere for free.

**[▶ Play it live](#)** · _(add your deploy URL here once it's live)_

## How to play
- Pick your nation on the menu, hit **START MATCH**.
- **Swipe up** toward the goal to shoot. Swipe **left/right** to aim, give it an **arced swipe** to curve the ball, and **flick further** for more power (too far and it sails over!).
- The keeper patrols the goal — shoot into the gap.
- 5 penalties. Score more than the keeper saves to win. Earn badges (Hat-trick, Panenka, Top Bins, Curler, Perfect 5/5).

## Run locally
```bash
npm run dev        # serves on http://localhost:3456
```
Or just **double-click `index.html`** — it runs straight from the file (the only external resource is Google Fonts, which needs internet; it falls back to system fonts offline).

## Deploy for free

It's a static site (just `index.html`, `style.css`, `game.js`), so any static host works. Two easy options:

### Option A — Vercel (fastest, no GitHub needed)
```bash
npm i -g vercel    # one-time
vercel             # run in this folder; log in once, accept the defaults
vercel --prod      # promote to your permanent production URL
```
Vercel auto-detects a static site (no build). You get a `https://<project>.vercel.app` URL.

### Option B — GitHub Pages (great for a portfolio — shows the repo + commit history)
```bash
# create a repo and push (needs the GitHub CLI `gh`, or do it via github.com)
gh repo create spot-kickers --public --source=. --push
```
Then on GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.**
Live at `https://<your-username>.github.io/spot-kickers/` in ~1 minute.

> No CLI? Drag this folder's files onto **[app.netlify.com/drop](https://app.netlify.com/drop)** for an instant link.

## Tuning the game feel
All gameplay constants live in the `CFG` object at the top of `game.js`:

| Constant | What it does |
|---|---|
| `totalShots` | Penalties per match (default 5) |
| `ballSpeed` | Base ball flight speed |
| `keeperPatrolRange` / `keeperPatrolSpeed` | How far / fast the keeper slides |
| `keeperReach` | How wide an area the keeper can dive-save |
| `swipeSensX` / `powerSpan` / `curveScale` | Swipe aim sensitivity, power, and curve strength |
| `overThresh` | Power above which the shot sails over the bar |
| `slowmoScale` / `finalZoom` | Slow-mo + camera zoom on the final kick |

## Tech notes
- **Zero dependencies.** Everything (stadium, players, ball, particles) is drawn from code on a single `<canvas>`. Audio is synthesized live with the Web Audio API, so there are no image/sound assets or licences.
- **Responsive & mobile-first:** dynamic viewport units, safe-area insets, touch (pointer) input, optional vibration.
- **Persistence:** your team and unlocked achievements are saved in `localStorage`.

---
Made for the love of football. 🎩
