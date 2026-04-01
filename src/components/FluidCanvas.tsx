import { useRef, useEffect, useState } from 'react'
import { usePretext } from '../hooks/usePretext'
import { useFluidSim } from '../hooks/useFluidSim'
import { ambientOffset } from '../simulation/ambient'
import { rippleOffset, isWaveExpired } from '../simulation/ripple'
import { BG_COLOR, FONT, TEXT_COLOR } from '../constants'

export function FluidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [width, setWidth] = useState(0)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)

  // Init canvas context and track width changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    setCtx(canvas.getContext('2d'))

    const onResize = () => setWidth(window.innerWidth)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const { chars, totalHeight } = usePretext(width, ctx)
  const {
    waves,
    handleClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useFluidSim()

  // Sync canvas size whenever content height or width changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width === 0 || totalHeight === 0) return
    canvas.width = width
    canvas.height = totalHeight
  }, [width, totalHeight])

  // rAF render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !ctx || chars.length === 0) return

    let rafId: number

    const render = (now: number) => {
      waves.current = waves.current.filter(w => !isWaveExpired(w, now))

      ctx.fillStyle = BG_COLOR
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = TEXT_COLOR
      ctx.font = FONT

      for (const char of chars) {
        const ambient = ambientOffset(char, now)
        let dx = ambient.dx
        let dy = ambient.dy

        for (const wave of waves.current) {
          const r = rippleOffset(char, wave, now)
          dx += r.dx
          dy += r.dy
        }

        ctx.fillText(char.char, char.baseX + dx, char.baseY + dy)
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
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ display: 'block', cursor: 'crosshair', touchAction: 'none' }}
    />
  )
}
