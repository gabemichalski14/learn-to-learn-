# Lottie drop-zone — celebratory flourishes & loops

Put your Lottie `.json` files here and they play automatically (nothing renders
until a file exists, so it's always safe). Best for **celebrations + ambient
loops**; characters that *react* to taps are Rive's job (`public/rive/`).

## Wired right now (proof-of-concept)
| File | Where it plays | Notes |
|---|---|---|
| `celebrate.json` | Checkpoint **pass** screen | one-shot confetti/sparkle burst over the win card |

To see it: drop a `celebrate.json` here, pass a level's Checkpoint → the burst plays.

## How to get a `.json` (all free)
1. **LottieFiles.com** — thousands of free animations; download as **Lottie JSON**
   (a confetti/sparkle/“celebration” search is perfect for `celebrate.json`).
2. Or export your own from **After Effects** with the free **Bodymovin/LottieFiles** plugin.
3. Save it here with the exact name from the table above.

## Notes
- Pure JS (lottie-web) — no WASM, no CSP change, works offline.
- The player only loads once a real `.json` is present (HEAD-probed) — no bundle
  cost until then; it's a separate lazy chunk regardless.
- Easy next wires (one line each): level-up burst, sticker pop, the village
  "moving-in" fanfare — pass a different `src` to `<LottieFX>`.
