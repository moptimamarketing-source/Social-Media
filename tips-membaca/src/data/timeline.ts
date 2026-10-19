/**
 * Scene timing — every cue is looked up from the aligned voiceover
 * (src/data/captions.ts), so if the audio is re-aligned the whole edit follows.
 * w('word', afterSeconds) = onset of the first matching word after that time.
 */
import {AUDIO_DURATION, captions} from './captions';

export const VIDEO = {fps: 30, width: 1080, height: 1920, duration: Math.ceil((AUDIO_DURATION + 1.1) * 10) / 10};

const words = captions.flatMap((c) => c.words);
export const w = (word: string, after = 0): number => {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z-]/g, '');
  const hit = words.find((x) => x.t >= after && norm(x.w) === norm(word));
  if (!hit) throw new Error(`cue word not found: ${word} after ${after}`);
  return hit.t;
};

export const S1 = {start: 0, end: 6.45, tips: w('tips'), untuk: w('untuk'), ibu: w('ibu'), ayah: w('ayah'), question: w('ibu', 4), tahu: w('tahu'), tak: w('tak?')};
export const S2 = {start: 6.3, end: 10.85, bila: w('bila'), tak: w('tak', 7), lancar: w('lancar'), membaca: w('membaca,'), semua: w('semua'), berat: w('berat.')};
export const S3 = {start: 10.7, end: 18.35, homework: w('homework'), lambat: w('lambat,'), soalan: w('soalan'), faham: w('faham,'), dan: w('dan', 13), expand: w('anak', 14), saya: w('saya'), pandai: w('pandai.')};
export const S4 = {
  start: 18.2, end: 30.45, membaca: w('membaca', 18), penting: w('penting'), sebab: w('sebab'), kunci: w('kunci'), seperti: w('seperti'),
  bm: w('bahasa'), en: w('english,'), sains: w('sains,'), maths: w('maths,'), semua: w('semua', 27), faham: w('faham', 28), arahan: w('arahan.'),
};
export const S5 = {start: 30.3, end: 38.35, bila: w('bila', 30), boleh: w('boleh', 31), lebih: w('lebih', 33), yakin: w('yakin,'), tak: w('tak', 34), salah: w('salah,'), dan: w('dan', 35), berdikari: w('berdikari.'), lebih2: w('lebih', 36)};
export const S6 = {start: 38.2, end: 40.9, ibu: w('ibu', 38), kurang: w('kurang'), stres: w('stres.')};
export const S7 = {start: 40.75, end: 47.75, jadi: w('jadi', 40.5), kalau: w('kalau', 41), tersekat: w('tersekat-sekat,'), jangan: w('jangan'), tunggu: w('tunggu'), sampai: w('sampai'), makin: w('makin'), besar: w('besar'), makin2: w('makin', 46), down: w('down.')};
export const S8 = {start: 47.6, end: 52.25, kuatkan: w('kuatkan'), asas: w('asas'), baca: w('baca', 48), baru: w('baru'), semua: w('semua', 49), pelajaran: w('pelajaran'), jadi: w('jadi', 50), senang: w('senang.')};
export const S9 = {start: 52.1, end: VIDEO.duration, kalau: w('kalau', 52), tahu: w('tahu', 52), teknik: w('teknik'), berfungsi: w('berfungsi'), anda: w('anda…'), komen: w('komen,'), like: w('like'), share: w('share!'), logo: AUDIO_DURATION - 0.1};

export type Sfx = 'pop' | 'tick' | 'whoosh' | 'swipe' | 'boing' | 'ding' | 'scribble' | 'clock' | 'thud' | 'sparkle' | 'impact';
/** Sound design, low under the voice. */
export const sfx: {t: number; name: Sfx; vol: number}[] = [
  {t: 0.0, name: 'impact', vol: 0.28}, {t: S1.tips, name: 'boing', vol: 0.22}, {t: S1.untuk, name: 'swipe', vol: 0.18}, {t: S1.ibu, name: 'pop', vol: 0.18},
  {t: S1.ayah, name: 'pop', vol: 0.18}, {t: S1.question, name: 'boing', vol: 0.22}, {t: S1.end - 0.25, name: 'whoosh', vol: 0.3},
  {t: S2.tak, name: 'impact', vol: 0.16}, {t: S2.membaca, name: 'scribble', vol: 0.14}, {t: S2.semua + 0.15, name: 'thud', vol: 0.3}, {t: S2.berat + 0.12, name: 'thud', vol: 0.38},
  {t: S3.start, name: 'whoosh', vol: 0.24}, {t: S3.homework, name: 'swipe', vol: 0.2}, {t: S3.soalan, name: 'swipe', vol: 0.2}, {t: S3.dan, name: 'swipe', vol: 0.16},
  {t: S3.saya, name: 'tick', vol: 0.1},
  {t: S4.start, name: 'sparkle', vol: 0.3}, {t: S4.membaca, name: 'whoosh', vol: 0.18}, {t: S4.kunci, name: 'sparkle', vol: 0.26}, {t: S4.bm, name: 'pop', vol: 0.22},
  {t: S4.en, name: 'pop', vol: 0.22}, {t: S4.sains, name: 'pop', vol: 0.22}, {t: S4.maths, name: 'thud', vol: 0.22}, {t: S4.semua, name: 'swipe', vol: 0.18}, {t: S4.arahan, name: 'ding', vol: 0.2},
  {t: S5.start, name: 'whoosh', vol: 0.24}, {t: S5.boleh, name: 'sparkle', vol: 0.3}, {t: S5.yakin, name: 'pop', vol: 0.22}, {t: S5.tak, name: 'pop', vol: 0.22},
  {t: S5.salah, name: 'ding', vol: 0.2}, {t: S5.berdikari, name: 'sparkle', vol: 0.28},
  {t: S6.start, name: 'whoosh', vol: 0.22}, {t: S6.kurang, name: 'pop', vol: 0.2}, {t: S6.stres, name: 'pop', vol: 0.2},
  {t: S7.start, name: 'swipe', vol: 0.22}, {t: S7.kalau, name: 'clock', vol: 0.22}, {t: S7.tersekat, name: 'clock', vol: 0.22}, {t: S7.jangan, name: 'impact', vol: 0.36},
  {t: S7.tunggu, name: 'impact', vol: 0.3}, {t: S7.makin, name: 'swipe', vol: 0.16}, {t: S7.down, name: 'thud', vol: 0.2},
  {t: S8.kuatkan, name: 'thud', vol: 0.35}, {t: S8.asas + 0.2, name: 'thud', vol: 0.3}, {t: S8.semua, name: 'thud', vol: 0.2}, {t: S8.pelajaran, name: 'thud', vol: 0.2},
  {t: S8.pelajaran + 0.35, name: 'thud', vol: 0.2}, {t: S8.jadi, name: 'thud', vol: 0.2}, {t: S8.senang, name: 'sparkle', vol: 0.3},
  {t: S9.start, name: 'whoosh', vol: 0.26}, {t: S9.tahu, name: 'swipe', vol: 0.2}, {t: S9.teknik, name: 'impact', vol: 0.2}, {t: S9.komen, name: 'pop', vol: 0.26},
  {t: S9.like, name: 'pop', vol: 0.26}, {t: S9.share, name: 'pop', vol: 0.26}, {t: S9.logo, name: 'sparkle', vol: 0.3},
];
