import React from 'react';
import {SpringConfig} from 'remotion';
import {EI, ELASTIC, lerp, prog, sp, useT} from '../lib/time';

type From = 'scale' | 'up' | 'down' | 'left' | 'right' | 'spin' | 'flip';

/** Springs children in at `at` (abs s) and out at `until`. */
export const Pop: React.FC<{at: number; until?: number; from?: From; config?: Partial<SpringConfig>; dist?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  at, until, from = 'scale', config = ELASTIC, dist = 300, children, style,
}) => {
  const {t, f, fps} = useT();
  if (t < at - 0.01) return null;
  if (until !== undefined && t > until + 0.3) return null;
  const s = sp(f, fps, at, config);
  const out = until !== undefined ? prog(t, until, until + 0.25, EI) : 0;
  let tr = '';
  switch (from) {
    case 'scale': tr = `scale(${s})`; break;
    case 'up': tr = `translateY(${(1 - s) * dist}px) scale(${lerp(0.6, 1, Math.min(1, s))})`; break;
    case 'down': tr = `translateY(${(1 - s) * -dist}px)`; break;
    case 'left': tr = `translateX(${(1 - s) * -dist}px) rotate(${(1 - s) * -12}deg)`; break;
    case 'right': tr = `translateX(${(1 - s) * dist}px) rotate(${(1 - s) * 12}deg)`; break;
    case 'spin': tr = `rotateY(${(1 - s) * 540}deg) scale(${lerp(0.3, 1, Math.min(1, s))})`; break;
    case 'flip': tr = `perspective(900px) rotateX(${(1 - s) * -90}deg)`; break;
  }
  return <div style={{transform: `${tr} scale(${1 - out})`, opacity: 1 - out, transformStyle: 'preserve-3d', ...style}}>{children}</div>;
};

/** Gentle idle float + sway. */
export const Float: React.FC<{amp?: number; speed?: number; rot?: number; phase?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  amp = 14, speed = 0.5, rot = 4, phase = 0, children, style,
}) => {
  const {t} = useT();
  const a = t * speed * Math.PI * 2 + phase;
  return <div style={{transform: `translateY(${Math.sin(a) * amp}px) rotate(${Math.sin(a * 0.7) * rot}deg)`, transformStyle: 'preserve-3d', ...style}}>{children}</div>;
};
