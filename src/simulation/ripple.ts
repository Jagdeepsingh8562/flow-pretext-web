import { WAVE_SPEED, WAVE_STRENGTH, WAVE_DECAY, WAVE_MAX_AGE } from '../constants'
import type { Char, Wave } from './types'

export function rippleDy(char: Char, wave: Wave, now: number): number {
  const age = now - wave.birthTime
  if (age > WAVE_MAX_AGE) return 0
  const dist = Math.hypot(char.baseX - wave.x, char.baseY - wave.y)
  const envelope = 1 - age / WAVE_MAX_AGE
  const t = dist - age * WAVE_SPEED
  return Math.sin(t) * (WAVE_STRENGTH / (1 + dist * WAVE_DECAY)) * envelope
}

export function isWaveExpired(wave: Wave, now: number): boolean {
  return now - wave.birthTime > WAVE_MAX_AGE
}
