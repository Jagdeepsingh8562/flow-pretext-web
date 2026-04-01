import { useRef, useEffect, useState } from 'react'
import { usePretext } from '../hooks/usePretext'
import { useFluidSim } from '../hooks/useFluidSim'
import { ambientDy } from '../simulation/ambient'
import { rippleDy, isWaveExpired } from '../simulation/ripple'
import { BG_COLOR, FONT, TEXT_COLOR } from '../constants'

export function FluidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)

  // Init canvas and handle resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    setCtx(context)

    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const chars = usePretext(size, ctx)
  const { waves, handleClick } = useFluidSim()

  // rAF render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !ctx || chars.length === 0) return

    let rafId: number

    const render = (now: number) => {
      // Prune expired waves in place
      waves.current = waves.current.filter(w => !isWaveExpired(w, now))

      ctx.fillStyle = BG_COLOR
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = TEXT_COLOR
      ctx.font = FONT

      for (const char of chars) {
        let dy = ambientDy(char, now)
        for (const wave of waves.current) {
          dy += rippleDy(char, wave, now)
        }
        ctx.fillText(char.char, char.baseX, char.baseY + dy)
      }

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafId)
  }, [ctx, chars, waves])

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{ display: 'block', cursor: 'crosshair' }}
    />
  )
}
