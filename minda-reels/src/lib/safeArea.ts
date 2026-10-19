import {cameraAt, toScreen, Vec} from './camera';
import {camera, speakers} from '../data/timeline';

/**
 * TikTok / Reels safe zone on 1080×1920: keep clear of the top bar (~200px),
 * the caption + username block at the bottom (~420px) and the right-hand
 * button column (~130px).
 */
export const SAFE = {top: 210, bottom: 1500, left: 60, right: 950};

export const SUBTITLE_Y = 1400;

export type PosPreset = 'top-left' | 'top-center' | 'top-right' | 'upper-left' | 'upper-right' | 'auto-upper' | 'auto-top';

const PRESETS: Record<Exclude<PosPreset, 'auto-upper' | 'auto-top'>, Vec> = {
  'top-left': [290, 330],
  'top-center': [540, 330],
  'top-right': [770, 330],
  'upper-left': [300, 720],
  'upper-right': [770, 720],
};

const speakerFaceOnScreen = (t: number): Vec | null => {
  const s = speakers.find((sp) => t >= sp.start && t < sp.end);
  return s ? toScreen(cameraAt(camera, t), s.face) : null;
};

/** Resolve a position; `auto-*` puts the graphic on the side opposite the speaker's face. */
export const resolvePos = (pos: Vec | PosPreset, t: number): Vec => {
  if (Array.isArray(pos)) return pos;
  if (pos === 'auto-upper' || pos === 'auto-top') {
    const face = speakerFaceOnScreen(t);
    const left = face ? face[0] > 540 : false;
    const y = pos === 'auto-top' ? 330 : 720;
    return [left ? 300 : 770, y];
  }
  return PRESETS[pos];
};

export const clampToSafe = ([x, y]: Vec, halfW = 0, halfH = 0): Vec => [
  Math.min(Math.max(x, SAFE.left + halfW), SAFE.right - halfW),
  Math.min(Math.max(y, SAFE.top + halfH), SAFE.bottom - halfH),
];
