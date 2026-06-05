# Copilot Instructions — Ovotron Poll

## Project overview

Two self-contained, dependency-free HTML pages for the [Ovotron.net](https://ovotron.net) brand:

| File | Purpose |
|------|---------|
| `index.html` | Animated canvas-based Tier-1 network topology visualization with a floating telemetry HUD |
| `Cybersecurity-Training-Poll.html` | Single-page audience poll for cybersecurity training topics |

No build step, no package manager, no external dependencies. Everything — HTML, CSS, and JS — lives inline in each file.

## Local preview

```bash
python -m http.server 8080
# open http://localhost:8080
```

---

## `index.html` — Architecture

### Canvas rendering model

The canvas context is created with **`{ alpha: false }`** — a deliberate performance optimization that also enables the motion-trail effect. Because the canvas has no alpha channel, the background is never fully cleared. Instead, `drawBackground()` fills the entire canvas with `rgba(4, 11, 19, 0.28)` each frame, leaving a faint persistence trail behind moving objects. **Do not replace this with `clearRect`** — doing so would eliminate the trail and break the visual.

### Animation loop

A single `requestAnimationFrame` loop drives everything. All movement is **delta-time normalized**:

```js
const dt = deltaMs / 16.67;   // deltaMs capped at 36 ms
```

Use `dt` as a multiplier for every position update and progress increment so the animation runs at the same speed regardless of frame rate.

Per-frame order of operations:
1. `drawBackground()` — semi-transparent fill for motion trails
2. Draw links between nearby `Particle` pairs (distance < `connectionDist`)
3. Spawn new `Packet` objects along active links (`packetChance * dt` probability, only when `!reducedMotion`)
4. Remove `Packet` objects where `progress >= 1`, then update + draw the survivors
5. Update + draw all `Particle` objects
6. Occasional full-canvas green glint: `if (Math.random() > 0.992)` fills with `rgba(49,255,199,0.03)` (skipped under `reducedMotion`)
7. Throttled HUD stats update every 700 ms

### Simulation objects

**`Particle`** — a network node:
- Bounces off viewport edges, velocity `±0.5 * dt` per axis
- Drawn as a filled circle: `rgba(${settings.color}, 0.86)`

**`Packet`** — data in transit:
- Travels linearly from `start` particle to `end` particle; `progress` increments by `speed * dt` (speed randomised 0.012–0.044)
- Drawn as a glowing 3.8 × 3.8 px square: white fill + `shadowColor: #31ffc7`, `shadowBlur: 10`
- Filtered out of `state.packets` once `progress >= 1`

Node count adapts to viewport area via `getNodeCount()` (range 80–190). Under `prefers-reduced-motion`, count is reduced to ~60% and no new packets are spawned.

### Mutable state and tunable settings

```js
// All runtime state
const state = {
    width, height,        // logical canvas size (CSS pixels)
    dpr,                  // devicePixelRatio capped at 2
    particles,            // Particle[]
    packets,              // Packet[]
    running,              // boolean — scan paused/running
    reducedMotion,        // boolean — from matchMedia, evaluated once at load
    lastStatsUpdate       // rAF timestamp of last HUD stat refresh
};

// Visual/behaviour knobs — safe to tweak without touching logic
const settings = {
    color: "49, 255, 199",        // RGB string for node + glow colour
    linkColor: "95, 197, 255",    // RGB string for inter-node links
    connectionDist: 170,          // px — max link length
    packetChance: 0.00085,        // probability per link per frame
    maxPackets: 520               // hard cap on live packets
};
```

`settings.color` / `settings.linkColor` are bare `"R, G, B"` strings embedded into `rgba(...)` templates in canvas draw calls. They are **separate from the CSS custom properties** — update both if changing the palette.

### Resize behaviour

`resize()` recalculates canvas dimensions, applies the DPR transform (`ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`), and **completely resets `state.particles` and `state.packets`**. Any in-flight packets are lost on resize — this is intentional.

### HUD lifecycle

The HUD (`<section class="hud">`) **starts collapsed** in the HTML markup; the launcher button starts with class `visible`. State is toggled exclusively by adding/removing CSS classes — no `display` or `visibility` changes.

| State | HUD element classes | Launcher classes |
|---|---|---|
| Closed | `hud collapsed` | `hud-launcher visible` |
| Open | `hud` | `hud-launcher` |

Auto-hide: `scheduleHudAutoHide()` sets a `setTimeout` for `HUD_AUTO_HIDE_MS` (4200 ms). The timer is reset on every user interaction and paused while the pointer is over the HUD (`pointerenter` / `pointerleave`).

Keyboard shortcuts: `P` = pause/resume scan · `Escape` = close HUD · `H` = open HUD.

**Inject Burst button** (`id="burst"`): calls `spawnBurst()`, which pushes up to 24 new `Packet` objects between random particle pairs (respecting the `maxPackets` cap) and logs `"BANDWIDTH BURST ROUTED THROUGH TIER-1 CORE"`. Also calls `scheduleHudAutoHide()` to restart the auto-hide timer.

### Telemetry log

`addLog(customMessage?)` prepends a `<div class="log-entry">` to `#logs` (a `role="log" aria-live="polite"` region) and trims the list to 9 entries. A `setInterval` fires `addLog()` with no argument every **2200 ms** to cycle random messages from `logMessages[]`.

### Brand mark

The OVOTRON logotype is an **inline SVG** inside `<div class="logo-wrap">`. There is no external image file involved. Do not substitute an `<img src="ovotron.png">`.

### Color system

CSS custom properties at `:root` (CSS layer only — not accessible to canvas code):

| Variable | Value | Role |
|---|---|---|
| `--bg-0` | `#040b13` | Deepest background |
| `--bg-1` | `#0d1f32` | Gradient origin |
| `--accent` | `#31ffc7` | Nodes, glow, status dot |
| `--accent-warm` | `#ffb870` | Warm radial highlight |
| `--text` | `#d5e8ff` | Primary text |
| `--muted` | `#88a6c7` | Labels, secondary text |
| `--line` | `rgba(95,197,255,0.32)` | HUD border |
| `--panel` | `rgba(8,21,35,0.74)` | HUD backdrop |

Font: `"Space Mono", "Consolas", "Courier New", monospace`.

Responsive breakpoint: **760 px** — HUD fills full viewport width and controls wrap.

---

## `Cybersecurity-Training-Poll.html` — Architecture

- Four `<input type="radio" name="module">` options inside `<form id="pollForm">`.
- Submit handler reads `form.querySelector('input[name="module"]:checked')`, writes to `#result` (`aria-live="polite"`). No network request — purely client-side.
- Each radio's `value` is the **full sentence** echoed verbatim into `#result` (`"Thanks! You selected: ${selected.value}"`). Keep `value` and visible label text identical when editing options.
- Color palette is hardcoded (no CSS variables): `#0f172a` body · `#111827` card · `#334155` border · `#60a5fa` button · `#93c5fd` result text.

---

## Conventions

- **Inline only** — no external stylesheets (`<link rel="stylesheet">`) or scripts (`<script src>`). Favicon and manifest `<link>` tags are present and intentional — do not remove them.
- **Vanilla only** — no frameworks, bundlers, or npm packages.
- Indentation: **4 spaces** in `index.html`, **2 spaces** in `Cybersecurity-Training-Poll.html`.
- All `<button>` elements use explicit `type="button"` (or `type="submit"`); add `aria-label` when visible text is insufficient.
- Any new CSS animation or transition must be suppressed inside the existing `@media (prefers-reduced-motion: reduce)` block.
- HUD stat values (`traffic`, `latency`, `packetRate`) are purely simulated — randomised on each `updateStats()` call. `nodeCount` is the only real value (`state.particles.length`).
