# Penalty Kick

A simple, polished browser penalty game: **tap where you want to shoot, and the keeper tries to save it.** Take 5 shots and see how many you can score. Built with HTML5 Canvas + vanilla JS — no dependencies, no backend, free to host.

## How to play

- Pick your team colour on the menu, hit **PLAY**.
- **Tap (or click) anywhere inside the goal** to shoot there.
- The keeper dives to try to save it — beat them into the corners!
- 5 shots total. Score as many as you can.

## Run locally

```bash
npm run dev
# then open http://localhost:3456
```

Or just **double-click `index.html`** — it runs straight from the file, no server needed.

## Deploy for free

### GitHub Pages

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Penalty Kick game"
   gh repo create penalty-kick --public --source=. --push
   ```
2. In the repo, go to **Settings → Pages**.
3. Under *Source*, choose **Deploy from a branch** → `main` → `/ (root)` → **Save**.
4. Live at `https://<your-username>.github.io/penalty-kick/` in ~60 seconds.

### Vercel

```bash
npm i -g vercel   # one-time install
vercel            # run from the project folder, follow prompts
```

Vercel auto-detects a static site (no build step). Live at a `.vercel.app` URL instantly; every push to `main` auto-deploys. Both options are **100% free** for a static site like this.

---

## Tuning the game feel

All gameplay constants live in the `CFG` object at the top of `game.js`:

| Constant | What it does |
|---|---|
| `totalShots` | How many shots per game (default 5) |
| `saveChance` | Base chance the keeper guesses your side and saves (0–1) |
| `ballSpeed` | How fast the ball flies to goal (higher = faster) |
| `shakeMag` | Screen-shake strength on a goal |

The whole game is three files — `index.html`, `style.css`, `game.js` — and audio is synthesized live with the Web Audio API, so there are no asset files or licences to worry about.
