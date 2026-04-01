// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { layoutWithLines } from '@chenglou/pretext'
import { FONT, LINE_HEIGHT } from '../constants'
import type { Char } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildChars(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepared: any,
  canvasWidth: number,
  canvasHeight: number,
  ctx: CanvasRenderingContext2D
): Char[] {
  const result = layoutWithLines(prepared, canvasWidth, LINE_HEIGHT)
  const chars: Char[] = []

  ctx.font = FONT

  const totalHeight = result.lines.length * LINE_HEIGHT
  const startY = Math.round((canvasHeight - totalHeight) / 2) + LINE_HEIGHT

  for (let li = 0; li < result.lines.length; li++) {
    const line = result.lines[li]
    const lineText: string = line.text
    const lineWidth = ctx.measureText(lineText).width
    const startX = Math.round((canvasWidth - lineWidth) / 2)

    let x = startX
    for (const char of lineText) {
      if (char.trim()) {
        chars.push({ char, baseX: x, baseY: startY + li * LINE_HEIGHT })
      }
      x += ctx.measureText(char).width
    }
  }

  return chars
}
