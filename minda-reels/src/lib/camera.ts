import {GLIDE, lerp, SNAP} from './anim';

export type Vec = [number, number];
export type CamKey = {
  /** composition time in seconds when this move starts */
  t: number;
  /** zoom, 1 = full frame */
  z: number;
  /** point in source pixels */
  at: Vec;
  /** keep: `at` stays put on screen while zooming. center: `at` becomes the frame centre. */
  mode?: 'keep' | 'center';
  /** move duration in seconds; 0 = hard cut */
  dur?: number;
  ease?: 'snap' | 'glide' | 'linear';
};
export type CamState = {z: number; cx: number; cy: number};

const W = 1080;
const H = 1920;

const clampState = (s: CamState): CamState => {
  const hw = W / 2 / s.z;
  const hh = H / 2 / s.z;
  return {z: s.z, cx: Math.min(Math.max(s.cx, hw), W - hw), cy: Math.min(Math.max(s.cy, hh), H - hh)};
};

export const keyToState = (k: Pick<CamKey, 'z' | 'at' | 'mode'>): CamState => {
  const z = Math.max(1, k.z);
  const [x, y] = k.at;
  if (k.mode === 'center') return clampState({z, cx: x, cy: y});
  return clampState({z, cx: x - (x - W / 2) / z, cy: y - (y - H / 2) / z});
};

const easeFor = (e: CamKey['ease']) => (e === 'snap' ? SNAP : e === 'linear' ? (x: number) => x : GLIDE);

const evalMove = (from: CamState, k: CamKey, t: number): CamState => {
  const target = keyToState(k);
  const d = k.dur ?? 0.25;
  const p = d <= 0 ? 1 : Math.min(1, Math.max(0, (t - k.t) / d));
  const e = easeFor(k.ease)(p);
  return {z: lerp(from.z, target.z, e), cx: lerp(from.cx, target.cx, e), cy: lerp(from.cy, target.cy, e)};
};

/** Camera state at time t. Each key animates from wherever the previous move had got to. */
export const cameraAt = (keys: CamKey[], t: number): CamState => {
  let active = keys[0];
  let from = keyToState(active);
  for (let i = 1; i < keys.length && keys[i].t <= t; i++) {
    from = evalMove(from, active, keys[i].t);
    active = keys[i];
  }
  return evalMove(from, active, t);
};

export const toScreen = (s: CamState, p: Vec): Vec => [(p[0] - s.cx) * s.z + W / 2, (p[1] - s.cy) * s.z + H / 2];

export const camTransform = (s: CamState) => `translate(${W / 2 - s.cx * s.z}px, ${H / 2 - s.cy * s.z}px) scale(${s.z})`;
