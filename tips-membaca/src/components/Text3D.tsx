import React from 'react';
import {C, F} from '../theme';
import {mix} from '../lib/color';
import {EI, ELASTIC, lerp, POP, prog, shakeAt, sp, useT} from '../lib/time';

export type Anim3D = 'elastic' | 'slam' | 'flip' | 'drop' | 'soft' | 'none';

type Props = {
  text: string;
  /** absolute second the first letter starts animating */
  at: number;
  size: number;
  anim?: Anim3D;
  face?: [string, string];
  side?: string;
  depth?: number;
  stagger?: number;
  tiltX?: number;
  tiltY?: number;
  /** absolute second to animate out */
  exitAt?: number;
  /** continuous gentle float */
  float?: boolean;
  letterSpacing?: number;
  style?: React.CSSProperties;
};

/**
 * Extruded 3D typography: a stacked-shadow extrusion (darkening with depth),
 * a gradient bevel face with a top rim light, perspective tilt and
 * per-letter spring animation.
 */
export const Text3D: React.FC<Props> = ({
  text, at, size, anim = 'elastic', face = [C.white, '#DDE6FF'], side = C.navyMid, depth, stagger = 0.035,
  tiltX = 14, tiltY = 0, exitAt, float = true, letterSpacing = 2, style,
}) => {
  const {t, f, fps} = useT();
  const d = depth ?? Math.max(6, Math.round(size * 0.085));
  const dx = -tiltY * 0.04;
  const shadow = Array.from({length: d}, (_, i) => `${(dx * (i + 1)).toFixed(2)}px ${i + 1}px 0 ${mix(side, '#000000', (i / d) * 0.55)}`)
    .concat([`0 ${d + 14}px 22px rgba(0,0,0,0.45)`])
    .join(',');
  const out = exitAt !== undefined ? prog(t, exitAt, exitAt + 0.28, EI) : 0;
  const fl = float ? Math.sin((t - at) * 2.2) * 6 : 0;
  const chars = Array.from(text);
  let shake = 0;
  if (anim === 'slam') shake = shakeAt(t, at + 0.08, 10, 0.35);
  return (
    <div style={{perspective: 1100, display: 'inline-block', opacity: 1 - out, ...style}}>
      <div style={{transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${fl - out * 40}px) translateX(${shake}px) scale(${1 - out * 0.25})`,
        transformStyle: 'preserve-3d', whiteSpace: 'nowrap', fontFamily: F.display, fontSize: size, lineHeight: 1, letterSpacing}}>
        {chars.map((ch, i) => {
          const t0 = at + i * stagger;
          let tr = '';
          let op = 1;
          if (anim === 'elastic') {
            const s = sp(f, fps, t0, ELASTIC);
            tr = `translateY(${(1 - s) * size * 0.5}px) scale(${s})`;
            op = t >= t0 ? 1 : 0;
          } else if (anim === 'slam') {
            const s = sp(f, fps, t0, {damping: 12, stiffness: 320, mass: 0.7});
            tr = `scale(${lerp(3.2, 1, s)})`;
            op = prog(t, t0, t0 + 0.06);
          } else if (anim === 'flip') {
            const s = sp(f, fps, t0, POP);
            tr = `rotateX(${(1 - s) * -105}deg)`;
            op = prog(t, t0, t0 + 0.08);
          } else if (anim === 'drop') {
            const s = sp(f, fps, t0, {damping: 9, stiffness: 170, mass: 1.1});
            tr = `translateY(${(1 - s) * -size * 3}px) rotate(${(1 - s) * 25}deg)`;
            op = t >= t0 ? 1 : 0;
          } else if (anim === 'soft') {
            const p = prog(t, t0, t0 + 0.7);
            tr = `translateY(${(1 - p) * 26}px)`;
            op = p;
          }
          if (ch === ' ') return <span key={i} style={{display: 'inline-block', width: size * 0.28}} />;
          return (
            <span key={i} style={{display: 'inline-block', position: 'relative', transform: tr, transformOrigin: '50% 90%', opacity: op,
              filter: anim === 'soft' ? `blur(${(1 - op) * 10}px)` : undefined}}>
              <span style={{color: side, textShadow: shadow}}>{ch}</span>
              <span style={{position: 'absolute', left: 0, top: 0, backgroundImage: `linear-gradient(180deg, ${face[0]} 18%, ${face[1]} 92%)`,
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                filter: `drop-shadow(0 -2px 0 ${mix(face[0], '#ffffff', 0.7)})`}}>{ch}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Preset looks so headlines stay consistent. */
export const LOOK = {
  white: {face: [C.white, '#D7E2FF'] as [string, string], side: C.navyMid},
  yellow: {face: ['#FFE98A', C.yellow] as [string, string], side: C.yellowDark},
  navy: {face: ['#3A63C9', C.navy] as [string, string], side: '#030A1F'},
  red: {face: ['#FF8A8D', C.red] as [string, string], side: '#7A1518'},
};
