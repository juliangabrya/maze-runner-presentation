# 🤖 Maze Runner

An autonomous **micro:bit + CutebotPro** robot that solves a maze it has never seen — using three
distance sensors, the **left-hand rule**, and a radio that broadcasts the solved route to a second robot.

Built by **Abhi · Julian C · Julian G · Sam**.

## ▶ View the presentation

Open **`index.html`** (the landing page) and click **Open the presentation**, or go straight to a deck:

| File | What it is |
|------|------------|
| **`index-nexus.html`** | ⭐ The full 22-slide talk (governor edition) — neural-network / data-grid theme |
| `index-neon.html` | Same talk, dark tactical "mission-control" theme |
| `index-editorial.html` | Same talk, light ink-on-paper editorial theme |
| `index-city.html` | Same talk, synthwave neon-city theme |
| `brief.html` | One-page presenter cheat-sheet, glossary & likely Q&A |
| `script.html` | Printable speaker script — slide-by-slide, who says what |
| `maze-plan.html` | Printable build plan for the physical 5×5 demo maze |
| `code.html` / `maze-runner.ts` | The micro:bit firmware (left-hand rule, no move cap) — copy into MakeCode |

Everything is **pure HTML/CSS/JS — no build step, no dependencies.** Just open a file in any browser.

### Controls
- **← / → / Space** — move between slides · **click the dots** — jump
- On the **live demo** slide: the robot solves a fresh maze; **New Maze** restarts, **Stop / S** pauses
- The demo's "thinking" panel shows the robot's decision in real time

## 🧠 How it works
1. **Sense** — read distance to the left, right and front walls (millimetres)
2. **Classify** — is each side open? is the front clear?
3. **Decide** — priority chain `LEFT → FORWARD → RIGHT → BACK`, take the first that's open
4. **Act** — turn, drive one cell, record the move — repeat ~20×/second until the goal

The left-hand rule is *mathematically guaranteed* to solve any perfect maze.

## 📶 Works offline
The site is a PWA — a service worker (`sw.js`) caches every page on the **first online visit**.
After that, the link keeps working with **no internet** (e.g. on the day, on school Wi‑Fi, or in airplane mode).
Tip: open the link once while online and click through each page so fonts cache too.

---
*Hosted with GitHub Pages — just share the link.*
