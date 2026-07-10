# Ovotron Poll

A pair of standalone HTML pages for the [Ovotron.net](https://ovotron.net) brand — a live network visualization landing page and a cybersecurity training audience poll.

## Pages

### `index.html` — Global Core Network Visualization

An animated, canvas-based Tier-1 network topology visualization with a floating telemetry HUD. Features include:

- Real-time animated node/packet graph rendered on `<canvas>`
- Telemetry panel showing live-updating traffic, latency, packet rate, and active node stats
- **Pause / Resume** scan and **Inject Burst** controls
- Keyboard shortcut: `P` to pause/resume
- Responsive dark UI with the Ovotron brand watermark

### `Cybersecurity-Training-Poll.html` — Cybersecurity Training Poll

A single-page poll to gauge audience interest in upcoming cybersecurity training modules. Visitors vote on which topic to cover first:

- Active & Passive Reconnaissance (footprinting, OSINT)
- Web Application Flaws (Broken Access Control, Injections, etc.)
- Adversary Tactics & Persistence (PAM/SSH backdoors, APT groups)
- "Just drop the schedule!"

The selection is confirmed client-side with an inline result message.

## Usage

Both pages are self-contained HTML files with no external dependencies or build step required. Open them directly in a browser or serve them from any static host.

```bash
# Quick local preview (Python)
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Assets

| File | Purpose |
|------|---------|
| `index.html` | Tier-1 network visualization landing page |
| `Cybersecurity-Training-Poll.html` | Audience poll for cybersecurity training topics |
| `ovotron.png` | Brand watermark used in the visualization (not tracked) |

## License

© Ovotron.net. All rights reserved.
