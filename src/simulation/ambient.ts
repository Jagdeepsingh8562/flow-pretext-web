import { AMBIENT_FREQ, AMBIENT_SPEED, AMBIENT_AMP } from '../constants'
import type { Char } from './types'

export function ambientDy(char: Char, time: number): number {
  return Math.sin(char.baseX * AMBIENT_FREQ + time * AMBIENT_SPEED) * AMBIENT_AMP
}
