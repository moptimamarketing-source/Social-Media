import React from 'react';
import {interpolate} from 'remotion';
import {EASE_OUT} from '../lib/anim';

/** Hand-drawn underline that draws itself on between `from` and `to` (frames). */
export const Scribble: React.FC<{frame: number; from: number; to: number; width: number; color: string; stroke?: number}> = ({
  frame, from, to, width, color, stroke = 12,
}) => {
  const p = interpolate(frame, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});
  const h = 40;
  const d = `M 6 ${h * 0.55} C ${width * 0.25} ${h * 0.2}, ${width * 0.45} ${h * 0.95}, ${width * 0.7} ${h * 0.45} S ${width * 0.92} ${h * 0.3}, ${width - 6} ${h * 0.6}`;
  const len = width * 1.25;
  return (
    <svg width={width} height={h} style={{overflow: 'visible', display: 'block'}}>
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
    </svg>
  );
};

/** Hand-drawn arrow from (0,0) to (dx,dy) used by handwritten callouts. */
export const Arrow: React.FC<{frame: number; from: number; dx: number; dy: number; color: string}> = ({frame, from, dx, dy, color}) => {
  const p = interpolate(frame, [from, from + 9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});
  const len = Math.hypot(dx, dy) * 1.2;
  const ang = Math.atan2(dy, dx);
  const head = (a: number) => `${dx - 34 * Math.cos(ang + a)} ${dy - 34 * Math.sin(ang + a)}`;
  const headP = interpolate(frame, [from + 7, from + 11], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg width={1} height={1} style={{overflow: 'visible', position: 'absolute', left: 0, top: 0}}>
      <path d={`M 0 0 Q ${dx * 0.1 + dy * 0.25} ${dy * 0.5}, ${dx} ${dy}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
      <path d={`M ${head(0.5)} L ${dx} ${dy} L ${head(-0.5)}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={headP} />
    </svg>
  );
};
