import { useRef, useCallback } from 'react'
import type { Wave } from '../simulation/types'

export function useFluidSim() {
  const waves = useRef<Wave[]>([])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    waves.current.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      birthTime: performance.now(),
    })
  }, [])

  return { waves, handleClick }
}
