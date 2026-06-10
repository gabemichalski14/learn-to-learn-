# Rive drop-zone — bring the characters to life

Put your `.riv` files here and they animate automatically (the app falls back to
the painted PNG until a file exists, so nothing ever breaks).

## Wired right now (proof-of-concept)
| File | Where it plays | Fallback if missing |
|---|---|---|
| `pip-host.riv` | The Village host Pip | painted `pip/happy.png` |

Drop a file named exactly `pip-host.riv` here → reload the Village → Pip animates.

## How to make one (all free)
1. Open the **free Rive editor** at rive.app (free plan is enough to author + export).
2. Either start from scratch or grab a free file from **rive.app/community**
   (download → `.riv`) just to see the runtime working.
3. Give it a **State Machine** named `State Machine 1` (the default) if you want
   it interactive; otherwise a plain timeline animation autoplays.
4. **Export → Runtime (.riv)** and save it here with the name from the table above.

## Notes
- The runtime (`@rive-app/react-canvas`) + the WASM (`/public/rive.wasm`) are
  self-hosted, so this works offline and within our strict CSP.
- The Rive code + WASM only load when a real `.riv` is present — no bundle cost
  until then.
- Next step once a `.riv` works: wire state-machine **inputs** (e.g. `cheer`,
  `wave`) to game events so Pip reacts to taps and correct answers.
