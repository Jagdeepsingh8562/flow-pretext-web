import { RIPPLE_SPEED, RIPPLE_AMPLITUDE, RIPPLE_WAVELENGTH, RIPPLE_RING_SPACING, RIPPLE_MAX_AGE } from '../constants'
import type { Char, Wave } from './types'

export interface RippleOffset {
  dx: number
  dy: number
}

export function rippleOffset(char: Char, wave: Wave, now: number): RippleOffset {
  const age = now - wave.birthTime
  if (age > RIPPLE_MAX_AGE) return { dx: 0, dy: 0 }

  const vecX = char.baseX - wave.x
  const vecY = char.baseY - wave.y
  const dist = Math.sqrt(vecX * vecX + vecY * vecY)

  const wavefrontRadius = age * RIPPLE_SPEED

  // How far this character is from the expanding wavefront
  const delta = dist - wavefrontRadius

  // Gaussian envelope — controls which characters are currently active
  const sigma = RIPPLE_WAVELENGTH / 2
  const envelope = Math.exp(-(delta * delta) / (2 * sigma * sigma))

  // Early-out — outside the active zone
  if (envelope < 0.005) return { dx: 0, dy: 0 }

  // Damped cosine oscillation within the envelope — creates multiple concentric rings.
  // cos(0) = 1 at the wavefront (max outward push), then oscillates inward/outward behind it.
  const rings = Math.cos((delta / RIPPLE_RING_SPACING) * Math.PI)

  // Distance decay: 1/√r — energy conservation for a circular wave
  const normalizedDecay = Math.sqrt(30 / Math.max(wavefrontRadius, 30))

  // Cosine fade in the last 30% of lifetime
  const lifeRatio = age / RIPPLE_MAX_AGE
  const timeFade = lifeRatio > 0.7
    ? 0.5 * (1 + Math.cos(Math.PI * (lifeRatio - 0.7) / 0.3))
    : 1.0

  const amplitude = RIPPLE_AMPLITUDE * envelope * rings * normalizedDecay * timeFade

  if (dist < 0.5) return { dx: 0, dy: 0 }

  const dirX = vecX / dist
  const dirY = vecY / dist

  return {
    dx: dirX * amplitude,
    dy: dirY * amplitude,
  }
}

export function isWaveExpired(wave: Wave, now: number): boolean {
  return now - wave.birthTime > RIPPLE_MAX_AGE
}
