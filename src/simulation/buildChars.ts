import { layoutWithLines } from '@chenglou/pretext'
import { FONT, LINE_HEIGHT, PADDING } from '../constants'
import type { Char } from './types'

export interface BuildResult {
  chars: Char[]
  totalHeight: number
}

// Reused across calls — Intl.Segmenter splits by grapheme cluster (correct for emoji, accents, etc.)
const segmenter = new Intl.Segmenter()

export function buildChars(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepared: any,
  canvasWidth: number,
  ctx: CanvasRenderingContext2D
): BuildResult {
  const usableWidth = canvasWidth - PADDING * 2
  const result = layoutWithLines(prepared, usableWidth, LINE_HEIGHT)
  const chars: Char[] = []

  ctx.font = FONT

  for (let li = 0; li < result.lines.length; li++) {
    const line = result.lines[li]
    const lineY = PADDING + li * LINE_HEIGHT

    // Center each line using pretext's pre-computed width — no re-measuring needed
    const startX = Math.round((canvasWidth - line.width) / 2)

    let x = startX
    for (const { segment } of segmenter.segment(line.text)) {
      if (segment.trim()) {
        chars.push({ char: segment, baseX: x, baseY: lineY })
      }
      x += ctx.measureText(segment).width
    }
  }

  const totalHeight = PADDING + result.lines.length * LINE_HEIGHT + PADDING

  return { chars, totalHeight }
}
