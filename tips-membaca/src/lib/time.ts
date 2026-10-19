import {Easing, interpolate, spring, SpringConfig, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * Everything in this project is keyed to absolute voiceover time (seconds),
 * so scenes, text and subtitles line up with src/data/captions.ts directly.
 */
export const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {f, fps, t: f / fps};
};

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const EO = Easing.bezier(0.22, 1, 0.36, 1);
export const EIO = Easing.bezier(0.65, 0, 0.35, 1);
export const EI = Easing.bezier(0.55, 0, 1, 0.45);

export const POP: Partial<SpringConfig> = {damping: 11, stiffness: 220, mass: 0.7};
export const ELASTIC: Partial<SpringConfig> = {damping: 7, stiffness: 190, mass: 0.6};
export const SOFT: Partial<SpringConfig> = {damping: 18, stiffness: 120, mass: 0.9};
export const HEAVY: Partial<SpringConfig> = {damping: 9, stiffness: 160, mass: 1.4};

/** Spring that starts at absolute second `t0`. */
export const sp = (f: number, fps: number, t0: number, config: Partial<SpringConfig> = POP) =>
  spring({frame: f - Math.round(t0 * fps), fps, config});

/** 0→1 between absolute seconds a and b. */
export const prog = (t: number, a: number, b: number, easing = EO) => interpolate(t, [a, b], [0, 1], {...CLAMP, easing});

/** Bump that is 1 during [a,b] and ramps over `ramp` seconds at both ends. */
export const window01 = (t: number, a: number, b: number, ramp = 0.2) =>
  Math.min(prog(t, a, a + ramp), 1 - prog(t, b - ramp, b, EI));

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Decaying shake starting at absolute second t0. */
export const shakeAt = (t: number, t0: number, amp: number, len = 0.4) => {
  const d = t - t0;
  if (d < 0 || d > len) return 0;
  return Math.sin(d * 70) * amp * (1 - d / len);
};

export const wobble = (t: number, speed = 1, amp = 1, phase = 0) => Math.sin(t * speed * Math.PI * 2 + phase) * amp;
