import {Easing, interpolate, spring, SpringConfig} from 'remotion';

export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const SNAP = Easing.bezier(0.16, 1, 0.3, 1);
export const GLIDE = Easing.bezier(0.45, 0, 0.55, 1);

export const SPRING_POP: Partial<SpringConfig> = {damping: 11, stiffness: 230, mass: 0.7};
export const SPRING_ELASTIC: Partial<SpringConfig> = {damping: 6.5, stiffness: 210, mass: 0.6};
export const SPRING_SOFT: Partial<SpringConfig> = {damping: 16, stiffness: 150, mass: 0.8};

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const springAt = (frame: number, fps: number, delay = 0, config = SPRING_POP) =>
  spring({frame: frame - delay, fps, config});

/** 0 → 1 over the last `len` frames of an element's life. */
export const exitAt = (frame: number, duration: number, len = 5) =>
  interpolate(frame, [duration - len, duration], [0, 1], {...CLAMP, easing: EASE_IN});

export const ramp = (frame: number, from: number, to: number, easing = EASE_OUT) =>
  interpolate(frame, [from, to], [0, 1], {...CLAMP, easing});

/** Decaying wobble, used for "shake on impact". */
export const shake = (frame: number, start: number, amp: number, len = 12) => {
  const f = frame - start;
  if (f < 0 || f > len) return 0;
  return Math.sin(f * 2.3) * amp * (1 - f / len);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
