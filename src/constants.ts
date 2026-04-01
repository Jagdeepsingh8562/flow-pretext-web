import rawText from '../sample.txt?raw'

// Strip metadata header (title, author, contributor bios, date) and copyright footer
const lines = rawText.split('\n')
export const DEFAULT_TEXT = lines.slice(7, -3).join('\n').trim()

export const FONT = '14px "SF Mono", "Courier New", monospace'
export const LINE_HEIGHT = 20
export const TEXT_COLOR = '#ffffff'
export const BG_COLOR = '#000000'
export const PADDING = 48 // top/left/right padding in px

export const AMBIENT_FREQ = 0.015
export const AMBIENT_SPEED = 0.004    // faster idle sway
export const AMBIENT_AMP = 4          // slightly more visible

export const RIPPLE_SPEED = 0.8       // px/ms — faster ring expansion
export const RIPPLE_AMPLITUDE = 22    // px — bigger push
export const RIPPLE_WAVELENGTH = 320  // px — wider pulse ring
export const RIPPLE_MAX_AGE = 3500    // ms — long enough to cross screen
