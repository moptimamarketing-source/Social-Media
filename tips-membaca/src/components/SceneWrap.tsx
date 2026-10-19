import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EI, lerp, prog, useT} from '../lib/time';

export type Enter = 'fade' | 'zoom' | 'iris' | 'slide-left' | 'slide-up' | 'flash' | 'wipe' | 'drop';
export type Exit = 'none' | 'fade' | 'zoom-through' | 'blur' | 'push-left';

/** Shows a scene between `start` and `end` (absolute seconds) with an entry and exit transition. */
export const SceneWrap: React.FC<{start: number; end: number; enter?: Enter; exit?: Exit; inDur?: number; outDur?: number; origin?: string; children: React.ReactNode}> = ({
  start, end, enter = 'fade', exit = 'none', inDur = 0.35, outDur = 0.3, origin = '50% 50%', children,
}) => {
  const {t} = useT();
  if (t < start || t >= end) return null;
  const p = prog(t, start, start + inDur);
  const q = exit === 'none' ? 0 : prog(t, end - outDur, end, EI);
  let transform = '';
  let filter = '';
  let opacity = 1;
  let clipPath: string | undefined;
  let flash = 0;
  switch (enter) {
    case 'fade': opacity = p; break;
    case 'zoom': transform += `scale(${lerp(1.3, 1, p)}) `; filter += `blur(${(1 - p) * 18}px) `; opacity = Math.min(1, p * 1.6); break;
    case 'iris': clipPath = `circle(${p * 120}% at 50% 52%)`; break;
    case 'slide-left': transform += `translateX(${(1 - p) * 1080}px) `; break;
    case 'slide-up': transform += `translateY(${(1 - p) * 1400}px) rotate(${(1 - p) * 6}deg) `; break;
    case 'wipe': clipPath = `polygon(0 0, ${p * 260}% 0, ${p * 260 - 100}% 100%, 0 100%)`; break;
    case 'flash': opacity = Math.min(1, p * 2); flash = 1 - p; break;
    case 'drop': transform += `translateY(${(1 - p) * -1920}px) `; break;
  }
  switch (exit) {
    case 'fade': opacity *= 1 - q; break;
    case 'zoom-through': transform += `scale(${1 + q * q * 7}) `; opacity *= 1 - q * q; filter += `blur(${q * 14}px) `; break;
    case 'blur': filter += `blur(${q * 22}px) `; transform += `scale(${1 + q * 0.12}) `; break;
    case 'push-left': transform += `translateX(${-q * 320}px) `; filter += `brightness(${1 - q * 0.5}) `; break;
  }
  return (
    <AbsoluteFill style={{transform: transform || undefined, transformOrigin: origin, filter: filter || undefined, opacity, clipPath, overflow: 'hidden'}}>
      {children}
      {flash > 0 ? <AbsoluteFill style={{background: '#FFF7D6', opacity: flash}} /> : null}
    </AbsoluteFill>
  );
};
