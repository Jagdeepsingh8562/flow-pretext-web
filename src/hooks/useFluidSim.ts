import { useRef, useCallback } from 'react'
import type { Wave } from '../simulation/types'

const DRAG_SPAWN_DISTANCE = 60 // px between wave spawns while dragging

export function useFluidSim() {
  const waves = useRef<Wave[]>([])
  const isDragging = useRef(false)
  const hasDragged = useRef(false)
  const lastSpawn = useRef<{ x: number; y: number } | null>(null)

  const spawnWave = useCallback((x: number, y: number) => {
    waves.current.push({ x, y, birthTime: performance.now() })
  }, [])

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent, touch?: React.Touch) => {
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect()
    const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX
    const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const maybeSpawnAlongDrag = useCallback((x: number, y: number) => {
    const last = lastSpawn.current
    if (!last) {
      spawnWave(x, y)
      lastSpawn.current = { x, y }
      return
    }
    const dist = Math.hypot(x - last.x, y - last.y)
    if (dist >= DRAG_SPAWN_DISTANCE) {
      spawnWave(x, y)
      lastSpawn.current = { x, y }
      hasDragged.current = true
    }
  }, [spawnWave])

  // ── Mouse ──────────────────────────────────────────────

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true
    hasDragged.current = false
    lastSpawn.current = null
    const { x, y } = getCanvasPos(e)
    spawnWave(x, y)
    lastSpawn.current = { x, y }
  }, [spawnWave])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return
    const { x, y } = getCanvasPos(e)
    maybeSpawnAlongDrag(x, y)
  }, [maybeSpawnAlongDrag])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    lastSpawn.current = null
  }, [])

  // Suppress click if user dragged (mousedown+move+mouseup fires click too)
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hasDragged.current) {
      hasDragged.current = false
      return
    }
    const { x, y } = getCanvasPos(e)
    spawnWave(x, y)
  }, [spawnWave])

  // ── Touch ──────────────────────────────────────────────

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    lastSpawn.current = null
    const touch = e.touches[0]
    const { x, y } = getCanvasPos(e, touch)
    spawnWave(x, y)
    lastSpawn.current = { x, y }
  }, [spawnWave])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    const { x, y } = getCanvasPos(e, touch)
    maybeSpawnAlongDrag(x, y)
  }, [maybeSpawnAlongDrag])

  const handleTouchEnd = useCallback(() => {
    lastSpawn.current = null
  }, [])

  return {
    waves,
    handleClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
