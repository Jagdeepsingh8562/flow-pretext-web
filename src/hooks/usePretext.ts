import { useState, useEffect, useRef } from 'react'
import { prepareWithSegments } from '@chenglou/pretext'
import { DEFAULT_TEXT, FONT } from '../constants'
import { buildChars } from '../simulation/buildChars'
import type { Char } from '../simulation/types'

export function usePretext(
  size: { width: number; height: number },
  ctx: CanvasRenderingContext2D | null
): Char[] {
  const [chars, setChars] = useState<Char[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const preparedRef = useRef<any>(null)

  useEffect(() => {
    if (!ctx || size.width === 0 || size.height === 0) return

    const run = async () => {
      if (!preparedRef.current) {
        preparedRef.current = await prepareWithSegments(DEFAULT_TEXT, FONT)
      }
      setChars(buildChars(preparedRef.current, size.width, size.height, ctx))
    }

    run()
  }, [ctx, size.width, size.height])

  return chars
}
