import { RIPPLE_SPEED, RIPPLE_AMPLITUDE, RIPPLE_WAVELENGTH, RIPPLE_MAX_AGE } from '../constants'
import type { Char, Wave } from './types'

export interface RippleOffset {
  dx: number
  dy: number
}

export function rippleOffset(char: Char, wave: Wave, now: number): RippleOffset {
  const age = now - wave.birthTime
  if (age > RIPPLE_MAX_AGE) return { dx: 0, dy: 0 }

  // Vector from wave origin to character
  const vecX = char.baseX - wave.x
  const vecY = char.baseY - wave.y
  const dist = Math.sqrt(vecX * vecX + vecY * vecY)

  // Where the wavefront ring is right now
  const wavefrontRadius = age * RIPPLE_SPEED

  // How far this character is from the expanding ring
  const delta = dist - wavefrontRadius

  // Gaussian pulse — single smooth ring, no endless oscillation
  const sigma = RIPPLE_WAVELENGTH / 2
  const gaussianPulse = Math.exp(-(delta * delta) / (2 * sigma * sigma))

  // Early-out: character is far outside the pulse — skip the rest
  if (gaussianPulse < 0.005) return { dx: 0, dy: 0 }

  // Distance decay: 1/√r (energy conservation for circular wave)
  // Normalized so decay = 1.0 at wavefrontRadius = 30px
  const normalizedDecay = Math.sqrt(30 / Math.max(wavefrontRadius, 30))

  // Smooth cosine fade in last 30% of lifetime
  const lifeRatio = age / RIPPLE_MAX_AGE
  const timeFade = lifeRatio > 0.7
    ? 0.5 * (1 + Math.cos(Math.PI * (lifeRatio - 0.7) / 0.3))
    : 1.0

  const amplitude = RIPPLE_AMPLITUDE * gaussianPulse * normalizedDecay * timeFade

  // Characters at exact click point get no displacement
  if (dist < 0.5) return { dx: 0, dy: 0 }

  // Radial direction unit vector
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
