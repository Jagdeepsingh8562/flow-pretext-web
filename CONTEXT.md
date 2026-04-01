# Raintext — Project Context & Handoff

## What This Is
A fluid text simulation web app. Fixed text is rendered on a fullscreen Canvas and behaves like fluid — gently undulating when idle, creating ripple waves on click/tap. Dark and minimal aesthetic.

---

## Key Decisions (already agreed)

| Decision | Choice |
|----------|--------|
| Platform | Web app |
| Framework | React + Vite (TypeScript) |
| Renderer | Canvas 2D |
| Text content | Fixed/preset text |
| Idle state | Gentle ambient sine wave |
| Click effect | Wave ripple — chars displace up/down from click point |
| Visual style | Dark & minimal — black bg, white text |

---

## Text Content Idea
`sample.txt` in the `raintext/` folder contains a poem — **"The First Water Is the Body" by Natalie Diaz** — which is thematically perfect for a fluid/water simulation. Consider using an excerpt as the default preset text, e.g.:

```
The river runs through the middle of my body.
Energy is a moving river moving my moving body.
A river is a body of water. It has a foot, an elbow, a mouth.
```

> Copyright ©2020 by Natalie Diaz — for personal/demo use only.

---

## Stack
- **React + Vite** (TypeScript) — already scaffolded in this folder
- **`@chenglou/pretext`** (`npm install @chenglou/pretext`) — text layout without DOM reflow
- **Canvas 2D** — all rendering, no DOM spans per character

---

## Before You Start — Fix npm Permissions

The scaffolding succeeded but `npm install` failed due to a cache permissions issue. Run this once in terminal:

```bash
sudo chown -R $(whoami) ~/.npm
```

Then install:

```bash
cd "/Users/jagdeepsingh/Desktop/dev work/raintext-app"
npm install
npm install @chenglou/pretext
npm run dev  # verify blank app runs
```

---

## How Pretext Works (critical context)

Pretext does **not** return per-character x/y positions directly. Here's the pattern:

```ts
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

// 1. Prepare once (async, ~19ms for 500 texts)
const prepared = await prepareWithSegments(text, '72px monospace')

// 2. Layout on each resize
const result = layoutWithLines(prepared, canvasWidth, lineHeight)
// result.lines[] → each line has .text, .width, .start/.end cursors

// 3. Walk segments + use ctx.measureText() to get per-character x offsets
// There is NO direct per-char position — you accumulate from segment widths
```

---

## File Structure to Build

```
src/
  constants.ts              ← DEFAULT_TEXT, FONT, colors, physics params
  simulation/
    types.ts                ← Char { char, baseX, baseY }, Wave { x, y, birthTime }
    buildChars.ts           ← pretext output → Char[] with x/y positions
    ambient.ts              ← idle sine wave: dy = sin(baseX * FREQ + time * SPEED) * AMP
    ripple.ts               ← click ripple: sin(dist - age) * decay per wave
  hooks/
    usePretext.ts           ← async prepare → Char[] (re-runs on resize)
    useFluidSim.ts          ← rAF loop + waves state + click handler
  components/
    FluidCanvas.tsx         ← <canvas> element, wires hooks together
  App.tsx                   ← root, mounts FluidCanvas
  index.css                 ← body { margin: 0; background: #000; overflow: hidden }
```

---

## Simulation Logic

### Char type
```ts
type Char = { char: string; baseX: number; baseY: number }
type Wave = { x: number; y: number; birthTime: number }
```

### Ambient wave (every frame, per character)
```ts
const dy = Math.sin(char.baseX * FREQ + time * SPEED) * AMPLITUDE
// FREQ ~0.015, SPEED ~0.002, AMPLITUDE ~6
```

### Ripple wave (per wave, per character)
```ts
const dist = Math.hypot(char.baseX - wave.x, char.baseY - wave.y)
const age  = (now - wave.birthTime) * WAVE_SPEED
const dy   = Math.sin(dist - age) * (STRENGTH / (1 + dist * DECAY)) * envelope
// Remove wave when age > MAX_AGE (~1500ms)
// WAVE_SPEED ~0.008, STRENGTH ~40, DECAY ~0.01
```

### Canvas render loop
```ts
ctx.clearRect(0, 0, w, h)
ctx.fillStyle = '#000'
ctx.fillRect(0, 0, w, h)
ctx.fillStyle = '#fff'
ctx.font = FONT
for (const char of chars) {
  const totalDy = ambientDy(char, time) + waves.reduce((sum, w) => sum + rippleDy(char, w, now), 0)
  ctx.fillText(char.char, char.baseX, char.baseY + totalDy)
}
```

---

## Physics Constants (starting values — tune to taste)

```ts
// constants.ts
export const FONT = '72px "SF Mono", "Courier New", monospace'
export const LINE_HEIGHT = 90
export const TEXT_COLOR = '#ffffff'
export const BG_COLOR = '#000000'

export const AMBIENT_FREQ = 0.015
export const AMBIENT_SPEED = 0.002
export const AMBIENT_AMP = 6

export const WAVE_SPEED = 0.008
export const WAVE_STRENGTH = 40
export const WAVE_DECAY = 0.01
export const WAVE_MAX_AGE = 1500  // ms
```

---

## Build Order

1. `constants.ts`
2. `simulation/types.ts`
3. `simulation/buildChars.ts`
4. `simulation/ambient.ts` + `simulation/ripple.ts`
5. `hooks/usePretext.ts`
6. `hooks/useFluidSim.ts`
7. `components/FluidCanvas.tsx`
8. `App.tsx` + `index.css`

---

## Verification Checklist

- [ ] `npm run dev` → fullscreen black canvas, white text visible
- [ ] Idle: text gently waves without any interaction
- [ ] Click: ripple spreads outward, chars displace then settle
- [ ] Multiple rapid clicks → overlapping waves
- [ ] Resize window → text re-lays out correctly
- [ ] No jank — 60fps in Chrome DevTools performance panel
