import { AMBIENT_FREQ, AMBIENT_SPEED, AMBIENT_AMP } from '../constants'
import type { Char } from './types'

export interface AmbientOffset {
  dx: number
  dy: number
}

export function ambientOffset(char: Char, time: number): AmbientOffset {
  const phase = char.baseX * AMBIENT_FREQ + time * AMBIENT_SPEED
  return {
    // Subtle horizontal drift — different frequency and phase offset so it's not synced to vertical
    dx: Math.cos(phase * 0.7 + 1.3) * (AMBIENT_AMP * 0.3),
    dy: Math.sin(phase) * AMBIENT_AMP,
  }
}
