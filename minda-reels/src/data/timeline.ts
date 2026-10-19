/**
 * EDIT DECISION LIST — change text, timing, zoom, b-roll and graphics here.
 * All times are in seconds on the final video (same clock as the source, the
 * edit never retimes the dialogue). Positions are [x, y] centre points in
 * pixels on the 1080×1920 frame, or a named preset (see lib/safeArea.ts).
 *
 * Source map (from the original edit):
 *   0.0–0.8   Ibu sorang di sofa: "Adik!"
 *   0.8–3.4   Over-shoulder, anak masuk: "Ya ibu, jom ikut ibu baca"
 *   3.9–7.2   Wide: "Hmm…" "Yalah, bolehlah" "Tapi kejap je kan ibu?"
 *   7.4–9.6   "Iya, sekejap saja" + selak buku
 *   9.9–11.7  "Adik nak baca 2 baris je, boleh?"
 *  11.9–13.7  "Amboi… ya ya yalah"
 *  13.8–15.0  "Lepas tu kita sambung lagi, tahu"
 *  15.4–18.1  "Okey baca ni… emm 'ba'"
 *  18.4–19.6  "Adik dah penatlah ibu"
 *  20.0–24.4  "Ya kita rehat sekejap… sambung lagi 5 minit, tahu? Boleh?" "Okey!"
 *  24.8–34.0  Host di meja Minda Optima (b-roll ibu & anak 26.0–28.05)
 *  34.2–37.5  CTA
 */
import type {CamKey, Vec} from '../lib/camera';
import type {PosPreset} from '../lib/safeArea';

export const VIDEO = {fps: 30, width: 1080, height: 1920, duration: 37.5};

export const SRC = {
  /** source with the old burned-in captions inpainted (tools/clean_captions.py) */
  footage: 'clean.mp4',
  /** loudness-normalised original dialogue, untouched otherwise */
  dialogue: 'dialogue.wav',
};

// ─── BASE FOOTAGE ────────────────────────────────────────────────────────────
// play = source plays in sync. freeze = hold source frame `at`.
// Freezes replace the old CapCut glitch/flash transitions.
export type Segment = {start: number; end: number; type: 'play'} | {start: number; end: number; type: 'freeze'; at: number};

export const segments: Segment[] = [
  {start: 0, end: 3.4, type: 'play'},
  {start: 3.4, end: 3.7, type: 'freeze', at: 3.36},
  {start: 3.7, end: 3.9, type: 'freeze', at: 3.9},
  {start: 3.9, end: 24.4, type: 'play'},
  {start: 24.4, end: 24.6, type: 'freeze', at: 24.36},
  {start: 24.6, end: 24.86, type: 'freeze', at: 24.87},
  {start: 24.86, end: 33.97, type: 'play'},
  {start: 33.97, end: 34.12, type: 'freeze', at: 33.95},
  {start: 34.12, end: 34.28, type: 'freeze', at: 34.28},
  {start: 34.28, end: 37.5, type: 'play'},
];

/** Whip-blur transitions, centred on `t`, `dur` seconds long (4–8 frames). */
export const whips: {t: number; dur: number; dir?: 1 | -1}[] = [
  {t: 3.7, dur: 0.2},
  {t: 24.6, dur: 0.24, dir: -1},
  {t: 34.12, dur: 0.2},
];

// ─── CAMERA (pseudo multi-cam from one source) ───────────────────────────────
// z = zoom. keep = face stays where it is while we punch in. snap = fast
// punch on a dialogue beat, glide = slow digital push.
const MOM_WIDE: Vec = [330, 1110];
const KID_WIDE: Vec = [675, 1095];
const HOST: Vec = [540, 720];

export const camera: CamKey[] = [
  {t: 0, z: 1.0, at: [300, 1050], dur: 0},
  {t: 0.05, z: 1.07, at: [300, 1050], dur: 0.75, ease: 'glide'}, // hook punch-in on "Adik!"
  {t: 0.8, z: 1.03, at: [560, 700], dur: 0}, // cut: kid walks in
  {t: 0.8, z: 1.09, at: [560, 700], dur: 2.6, ease: 'glide'},
  {t: 3.4, z: 1.15, at: [560, 700], dur: 0.3, ease: 'glide'}, // freeze push before whip
  {t: 3.7, z: 1.32, at: KID_WIDE, dur: 0}, // land tight on kid's "hmm"
  {t: 3.7, z: 1.18, at: KID_WIDE, dur: 0.35, ease: 'snap'},
  {t: 4.6, z: 1.05, at: [500, 1100], dur: 0.3, ease: 'snap'}, // two-shot "yalah bolehlah"
  {t: 4.9, z: 1.08, at: [500, 1100], dur: 0.95, ease: 'glide'},
  {t: 5.88, z: 1.24, at: KID_WIDE, dur: 0.22, ease: 'snap'}, // "tapi kejap je kan ibu?"
  // 7.2–9.1 b-roll inset (see layouts)
  {t: 9.1, z: 1.0, at: [540, 1100], dur: 0},
  {t: 9.1, z: 1.04, at: [540, 1100], dur: 0.8, ease: 'glide'},
  {t: 9.88, z: 1.2, at: [345, 1125], dur: 0.22, ease: 'snap'}, // mom: "2 baris je, boleh?"
  {t: 10.15, z: 1.25, at: [345, 1125], dur: 1.6, ease: 'glide'},
  {t: 11.85, z: 1.03, at: [540, 1120], dur: 0.25, ease: 'snap'}, // wide behind the PiP
  {t: 13.78, z: 1.1, at: [520, 1140], dur: 0.22, ease: 'snap'},
  {t: 14.0, z: 1.15, at: [520, 1140], dur: 1.3, ease: 'glide'},
  // 15.4–18.15 split screen (see layouts)
  {t: 18.15, z: 1.0, at: [540, 1100], dur: 0},
  {t: 18.36, z: 1.18, at: [660, 1080], dur: 0.2, ease: 'snap'}, // "adik dah penatlah ibu"
  {t: 19.7, z: 1.04, at: [480, 1110], dur: 0.28, ease: 'snap'},
  {t: 19.98, z: 1.14, at: MOM_WIDE, dur: 0.22, ease: 'snap'}, // "ya kita rehat sekejap"
  {t: 20.25, z: 1.17, at: MOM_WIDE, dur: 1.1, ease: 'glide'},
  {t: 21.46, z: 1.04, at: [520, 1120], dur: 0.25, ease: 'snap'}, // two-shot for the timer
  {t: 21.75, z: 1.06, at: [520, 1120], dur: 1.5, ease: 'glide'},
  {t: 23.36, z: 1.0, at: [540, 1100], dur: 0.2, ease: 'snap'},
  {t: 24.02, z: 1.08, at: [780, 960], dur: 0.18, ease: 'snap'}, // kid: "okey!"
  {t: 24.4, z: 1.16, at: [780, 960], dur: 0.2, ease: 'glide'},
  // host section — subtle digital camera
  {t: 24.6, z: 1.0, at: HOST, dur: 0},
  {t: 24.6, z: 1.04, at: HOST, dur: 1.4, ease: 'glide'},
  {t: 26.0, z: 1.1, at: [500, 760], dur: 0}, // b-roll push-in
  {t: 26.0, z: 1.22, at: [500, 760], dur: 2.05, ease: 'glide'},
  {t: 28.05, z: 1.12, at: HOST, dur: 0}, // back on host, tighter "camera"
  {t: 28.05, z: 1.15, at: HOST, dur: 1.7, ease: 'glide'},
  {t: 29.76, z: 1.0, at: HOST, dur: 0.25, ease: 'snap'}, // widen to show the books
  {t: 30.01, z: 1.03, at: HOST, dur: 1.3, ease: 'glide'},
  {t: 31.36, z: 1.08, at: HOST, dur: 0.22, ease: 'snap'},
  {t: 31.6, z: 1.12, at: HOST, dur: 1.4, ease: 'glide'},
  {t: 33.0, z: 1.0, at: [555, 840], dur: 0},
  {t: 33.0, z: 1.05, at: [555, 840], dur: 1.0, ease: 'glide'},
  {t: 34.12, z: 1.0, at: HOST, dur: 0},
  {t: 34.12, z: 1.03, at: HOST, dur: 3.4, ease: 'glide'},
];

/** Who is talking / where faces are (source px) — drives `auto-*` placement. */
export const speakers: {start: number; end: number; face: Vec}[] = [
  {start: 0, end: 0.8, face: [300, 1050]},
  {start: 0.8, end: 3.4, face: [300, 1300]},
  {start: 3.9, end: 7.2, face: KID_WIDE},
  {start: 7.2, end: 11.85, face: MOM_WIDE},
  {start: 11.85, end: 13.78, face: KID_WIDE},
  {start: 13.78, end: 18.36, face: MOM_WIDE},
  {start: 18.36, end: 19.98, face: [660, 1080]},
  {start: 19.98, end: 24.0, face: MOM_WIDE},
  {start: 24.0, end: 24.4, face: [780, 960]},
  {start: 24.6, end: 37.5, face: HOST},
];

// ─── PSEUDO B-ROLL LAYOUTS ───────────────────────────────────────────────────
// Re-uses the source: crop windows are {z, at} in source px (centre mode).
export type Crop = {z: number; at: Vec};
export type Layout =
  | {type: 'inset'; start: number; end: number; crop: Crop; card: {x: number; y: number; w: number; h: number; rotate: number}}
  | {type: 'split'; start: number; end: number; top: Crop; bottom: Crop};

export const layouts: Layout[] = [
  // close-up of hands flipping the book ("iya sekejap saja"), on a blurred copy of the wide
  {type: 'inset', start: 7.2, end: 9.1, crop: {z: 1.43, at: [464, 1483]}, card: {x: 90, y: 300, w: 900, h: 1250, rotate: -2}},
  // kid's face on top, book + pointing finger below ("okey baca ni… emm 'ba'")
  {type: 'split', start: 15.4, end: 18.15, top: {z: 1.6, at: [690, 1130]}, bottom: {z: 1.6, at: [560, 1620]}},
];

// ─── GRAPHICS ────────────────────────────────────────────────────────────────
export type Pos = Vec | PosPreset;
type Base = {start: number; end: number; position: Pos; rotate?: number; space?: 'screen' | 'world'};

export type Overlay =
  | (Base & {type: 'reaction-text'; text: string; variant: 'sticker' | 'comic' | 'burst'; animation?: 'pop' | 'slam'})
  | (Base & {type: 'speech-bubble'; text: string; width?: number; size?: 'sm' | 'lg'; tail: Vec})
  | (Base & {type: 'handwritten'; text: string; variant?: 'note' | 'ink'; arrowTo?: Vec})
  | (Base & {type: 'emoji'; text: string; size: number; badge?: number})
  | (Base & {type: 'metaphor'; left: string; right: string})
  | (Base & {type: 'timer'; label: string})
  | (Base & {type: 'callout-ring'; radius: number})
  | (Base & {type: 'pip'; size: number; crop: Crop})
  | (Base & {type: 'keyword-card'; badge: string; text: string; emoji: string; meter?: {label: string; fillFrom: number; plusAt: number}});

export const overlays: Overlay[] = [
  // skit — problem
  {type: 'speech-bubble', start: 3.92, end: 4.62, text: 'HMM… 🤨', position: [800, 790], tail: [700, 960], size: 'sm'},
  {type: 'metaphor', start: 5.95, end: 7.2, left: 'BACA 📚', right: 'MAIN 😆', position: [540, 640]},
  {type: 'reaction-text', start: 7.8, end: 9.08, text: 'SEKEJAP?! 😭', variant: 'sticker', position: [770, 360], rotate: 7},
  {type: 'handwritten', start: 8.35, end: 9.08, text: 'selak… selak… selak…', variant: 'ink', position: [360, 560], rotate: -6},
  // skit — negotiation
  {type: 'handwritten', start: 10.7, end: 11.85, text: '2 baris je ✌️', variant: 'note', position: 'auto-upper', rotate: 4},
  {type: 'pip', start: 11.9, end: 13.75, position: [300, 640], size: 400, crop: {z: 2.0, at: [715, 1250]}},
  {type: 'reaction-text', start: 12.0, end: 13.75, text: 'TERPAKSA 🙄', variant: 'comic', position: [700, 470], rotate: 6, animation: 'slam'},
  {type: 'callout-ring', start: 16.35, end: 18.15, position: [686, 1232], radius: 74},
  {type: 'reaction-text', start: 17.35, end: 18.15, text: '"BA"!', variant: 'comic', position: [840, 1080], rotate: -6, animation: 'slam'},
  // covers the old "adik dah penatlah ibu" title (world = sticks to the footage)
  {type: 'speech-bubble', space: 'world', start: 18.3, end: 19.94, text: 'Adik dah PENATLAH ibu… 😩', position: [545, 812], width: 900, size: 'lg', tail: [650, 1000]},
  {type: 'handwritten', start: 20.7, end: 21.45, text: 'lega~ 😌', variant: 'ink', position: 'auto-upper', rotate: -5},
  {type: 'timer', start: 22.42, end: 23.4, label: '5 MINIT', position: [540, 650]},
  // covers the old cat "Okay!" sticker
  {type: 'emoji', space: 'world', start: 23.38, end: 24.42, text: '🤝', size: 180, badge: 320, position: [832, 800], rotate: 10},
  {type: 'reaction-text', space: 'world', start: 23.42, end: 24.42, text: 'DEAL!', variant: 'burst', position: [585, 892], rotate: -8},
  // host — one card per point
  {type: 'keyword-card', start: 25.88, end: 28.32, badge: '02', text: 'PUJUK SIKIT JE', emoji: '🤏', position: [540, 290]},
  {type: 'keyword-card', start: 28.4, end: 31.3, badge: '03', text: 'BAGI DIA RASA SELESA', emoji: '😌', position: [540, 290]},
  {type: 'handwritten', start: 29.86, end: 31.3, text: 'Pantas Baca 📚', variant: 'ink', position: [300, 1000], rotate: -6, arrowTo: [240, 1170]},
  {
    type: 'keyword-card', start: 31.4, end: 34.0, badge: '04', text: 'BINA CONFIDENCE', emoji: '💪', position: [540, 320],
    meter: {label: 'CONFIDENCE', fillFrom: 31.75, plusAt: 33.0},
  },
];

// ─── STORY PROGRESS (Masalah → Pujuk → Selesa → Confident) ───────────────────
export const stages = {
  visible: [4.05, 24.4] as [number, number],
  steps: [
    {t: 4.05, label: 'MASALAH'},
    {t: 9.95, label: 'PUJUK'},
    {t: 28.4, label: 'SELESA'},
    {t: 31.4, label: 'CONFIDENT'},
  ],
};

// ─── HOOK ────────────────────────────────────────────────────────────────────
// Lives in world space so it covers the old title at the same spot.
export const hook = {
  end: 3.7,
  line1: 'ANAK SUKA',
  keyword: 'NEGO?!',
  emoji: '😩',
  subline: 'Bila nak membaca…',
  reaction: {t: 1.25, end: 2.3, emoji: '😑', at: [770, 560] as Vec},
};

// ─── CTA ─────────────────────────────────────────────────────────────────────
export const cta = {
  start: 33.98,
  headline: 'Nak lagi tips parenting ringkas?',
  items: [
    {t: 34.85, icon: '❤️', label: 'Like'},
    {t: 35.25, icon: '💬', label: 'Komen'},
    {t: 35.7, icon: '➕', label: 'Follow Minda Optima', primary: true},
  ],
};

// ─── SOUND DESIGN ────────────────────────────────────────────────────────────
export type Sfx = 'pop' | 'tick' | 'whoosh' | 'swipe' | 'boing' | 'ding' | 'scribble' | 'clock';
export const sfx: {t: number; name: Sfx; vol: number}[] = [
  {t: 0.0, name: 'whoosh', vol: 0.22},
  {t: 0.3, name: 'boing', vol: 0.3},
  {t: 0.62, name: 'scribble', vol: 0.22},
  {t: 1.0, name: 'pop', vol: 0.25},
  {t: 1.25, name: 'tick', vol: 0.2},
  {t: 3.58, name: 'whoosh', vol: 0.35},
  {t: 3.92, name: 'pop', vol: 0.25},
  {t: 4.05, name: 'tick', vol: 0.22},
  {t: 5.95, name: 'swipe', vol: 0.28},
  {t: 7.18, name: 'whoosh', vol: 0.3},
  {t: 7.8, name: 'pop', vol: 0.3},
  {t: 8.35, name: 'scribble', vol: 0.18},
  {t: 9.06, name: 'swipe', vol: 0.22},
  {t: 9.95, name: 'tick', vol: 0.22},
  {t: 10.7, name: 'scribble', vol: 0.22},
  {t: 11.9, name: 'pop', vol: 0.25},
  {t: 12.0, name: 'boing', vol: 0.18},
  {t: 15.38, name: 'whoosh', vol: 0.3},
  {t: 16.35, name: 'tick', vol: 0.2},
  {t: 17.35, name: 'pop', vol: 0.28},
  {t: 18.36, name: 'pop', vol: 0.3},
  {t: 20.7, name: 'scribble', vol: 0.18},
  {t: 22.42, name: 'clock', vol: 0.32},
  {t: 23.38, name: 'pop', vol: 0.3},
  {t: 24.05, name: 'ding', vol: 0.18},
  {t: 24.48, name: 'whoosh', vol: 0.38},
  {t: 25.88, name: 'swipe', vol: 0.26},
  {t: 28.4, name: 'swipe', vol: 0.26},
  {t: 29.86, name: 'scribble', vol: 0.2},
  {t: 31.4, name: 'swipe', vol: 0.26},
  {t: 33.0, name: 'ding', vol: 0.26},
  {t: 34.0, name: 'whoosh', vol: 0.35},
  {t: 34.3, name: 'pop', vol: 0.24},
  {t: 34.85, name: 'pop', vol: 0.24},
  {t: 35.25, name: 'pop', vol: 0.24},
  {t: 35.7, name: 'ding', vol: 0.24},
];
