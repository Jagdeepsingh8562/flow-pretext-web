import rawText from "../sample.txt?raw";

// Strip metadata header (title, author, contributor bios, date) and copyright footer
const lines = rawText.split("\n");
export const DEFAULT_TEXT = lines.slice(7, -3).join("\n").trim();

export const FONT = '14px "SF Mono", "Courier New", monospace';
export const LINE_HEIGHT = 26;
export const TEXT_COLOR = "#ffffff";
export const BG_COLOR = "#000000";
export const PADDING = 96; // generous top/side padding for artistic breathing room

export const AMBIENT_FREQ = 0.015;
export const AMBIENT_SPEED = 0.004; // very fast right-to-left drift
export const AMBIENT_AMP = 2.5; // barely any vertical movement

export const RIPPLE_SPEED = 0.75; // px/ms — fast ring expansion
export const RIPPLE_AMPLITUDE = 75; // px — wild, throw characters far
export const RIPPLE_WAVELENGTH = 360; // px — gaussian envelope width
export const RIPPLE_RING_SPACING = 90; // px — gap between oscillating rings
export const RIPPLE_MAX_AGE = 3500; // ms
