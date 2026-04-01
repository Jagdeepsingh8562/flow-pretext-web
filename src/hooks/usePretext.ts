import { useState, useEffect, useRef } from 'react'
import { prepareWithSegments } from '@chenglou/pretext'
import { DEFAULT_TEXT, FONT } from '../constants'
import { buildChars } from '../simulation/buildChars'
import type { Char } from '../simulation/types'

export interface PretextResult {
  chars: Char[]
  totalHeight: number
}

export function usePretext(
  width: number,
  ctx: CanvasRenderingContext2D | null
): PretextResult {
  const [result, setResult] = useState<PretextResult>({ chars: [], totalHeight: 0 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const preparedRef = useRef<any>(null)

  useEffect(() => {
    if (!ctx || width === 0) return

    const run = async () => {
      if (!preparedRef.current) {
        preparedRef.current = await prepareWithSegments(DEFAULT_TEXT, FONT)
      }
      const built = buildChars(preparedRef.current, width, ctx)
      setResult(built)
    }

    run()
  }, [ctx, width])

  return result
}
