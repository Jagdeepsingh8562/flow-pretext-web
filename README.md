# Raintext

A fluid text simulation. The full text of *The First Water Is the Body* by Natalie Diaz is rendered on a canvas and behaves like water — drifting at idle, rippling outward on click or drag, with waves that reflect back from the edges.

---

## What it does

- **Idle** — text drifts in a continuous right-to-left sine wave, barely moving vertically
- **Click** — spawns a ripple that expands outward from the click point, pushing characters radially away then pulling them back in oscillating rings
- **Drag** — leaves a trail of overlapping ripples as you move across the canvas
- **Touch** — same behaviour on mobile
- **Border reflections** — when a wave reaches the canvas edge, smaller waves bounce back using the mirror-image method (physically correct timing, no collision detection)

---

## Stack

- **React + Vite** (TypeScript)
- **Canvas 2D** — all rendering, no DOM spans per character
- **[@chenglou/pretext](https://www.npmjs.com/package/@chenglou/pretext)** — text layout and line-breaking without DOM reflow
- **Intl.Segmenter** — grapheme-correct character iteration

---

## Running locally

```bash
npm install
npm run dev
```

---

## How the simulation works

### Character layout

`prepareWithSegments()` measures the full poem once. On each resize, `layoutWithLines()` re-wraps the text to fit the canvas width. Each grapheme cluster gets a `{ baseX, baseY }` anchor position — the position it rests at when undisturbed. Every frame, a displacement `{ dx, dy }` is calculated per character and added before drawing.

### Ambient wave

A sine wave that drifts right-to-left continuously:

```
dx = cos(baseX * FREQ * 0.7 + time * SPEED + 1.3) * (AMP * 0.3)
dy = sin(baseX * FREQ + time * SPEED) * AMP
```

Amplitude is kept low so the drift is felt rather than seen.

### Ripple wave

Each click/drag spawns a `Wave { x, y, birthTime }`. Per character per frame:

1. **Wavefront** — `radius = age * RIPPLE_SPEED` (px/ms)
2. **Delta** — `dist - radius` (how far char is from the expanding ring)
3. **Gaussian envelope** — `exp(-delta² / 2σ²)` — smooth pulse, no endless oscillation
4. **Cosine rings** — `cos(delta / RING_SPACING * π)` modulates the envelope, creating multiple concentric push/pull rings
5. **Distance decay** — `1/√radius` (energy conservation for a 2D circular wave)
6. **Time fade** — cosine easing in the last 30% of lifetime
7. **Radial direction** — displacement is outward from the wave origin `(dx, dy) = dir * amplitude`

### Border reflections

For each real wave at `(wx, wy)`, 8 virtual mirror waves are computed on the fly — reflected over each border and corner (e.g. left mirror at `(-wx, wy)`). Mirror waves are passed through the same `rippleOffset()` function at 40% amplitude. Because the mirror is equidistant from the border, it arrives at the edge at the exact same moment as the real wave — no collision detection needed.

---

## Tuning

All physics constants live in [src/constants.ts](src/constants.ts):

| Constant | Effect |
|---|---|
| `RIPPLE_SPEED` | How fast the ring expands (px/ms) |
| `RIPPLE_AMPLITUDE` | How far characters are thrown |
| `RIPPLE_WAVELENGTH` | Width of the gaussian envelope (ring thickness) |
| `RIPPLE_RING_SPACING` | Distance between oscillating push/pull rings |
| `RIPPLE_MAX_AGE` | How long a wave lives (ms) |
| `RIPPLE_REFLECT_STRENGTH` | Reflected wave amplitude (0–1) |
| `AMBIENT_SPEED` | Speed of the idle drift |
| `AMBIENT_AMP` | Vertical amplitude of the idle wave |

---

## Text

*The First Water Is the Body* by Natalie Diaz, from *Postcolonial Love Poem* (Graywolf Press, 2020). Used here for personal/demo purposes only.
