/** The longest fade, however long the vanish time is. */
export const MAX_FADE_MS = 250;

/** The share of the vanish time that the fade takes, at most. */
const FADE_SHARE = 0.4;

/**
 * How long the beads take to fade out. The fade happens at the end of the
 * vanish time, so the beads are fully gone exactly when it ends (epic 002,
 * F2).
 */
export function fadeDurationMs(vanishMs: number): number {
  return Math.min(MAX_FADE_MS, Math.round(vanishMs * FADE_SHARE));
}
