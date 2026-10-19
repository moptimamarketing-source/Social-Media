import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F, outline} from '../theme';
import {EASE_OUT, ramp, shake, springAt} from '../lib/anim';

export type KineticAnim = 'elastic' | 'mask-up' | 'blur-in' | 'slide-left';

/**
 * One animated word/line. Animations are sequential by design: give each
 * piece its own `delay` (frames) instead of animating everything at once.
 */
export const KineticText: React.FC<{
  text: string;
  delay: number;
  anim: KineticAnim;
  size: number;
  color?: string;
  stroke?: number;
  shakeAmp?: number;
  style?: React.CSSProperties;
}> = ({text, delay, anim, size, color = C.white, stroke = 0, shakeAmp = 0, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = frame - delay;
  const base: React.CSSProperties = {fontFamily: F.display, fontSize: size, lineHeight: 0.95, color, whiteSpace: 'nowrap', display: 'inline-block',
    ...(stroke ? outline(stroke) : {}), ...style};

  if (anim === 'elastic') {
    // bouncy but contained: grows from its baseline so the overshoot never climbs into the line above
    const s = springAt(frame, fps, delay, {damping: 8, stiffness: 220, mass: 0.6});
    const rot = shake(frame, delay + 3, shakeAmp, 14);
    const sy = interpolate(s, [0, 1], [0.3, 1]);
    return <span style={{...base, transformOrigin: '50% 85%', transform: `scale(${s}, ${sy * Math.min(s, 1.08)}) rotate(${rot}deg)`, opacity: f >= 0 ? 1 : 0}}>{text}</span>;
  }
  if (anim === 'mask-up') {
    const p = ramp(frame, delay, delay + 9);
    return (
      <span style={{display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.08}}>
        <span style={{...base, transform: `translateY(${(1 - p) * 105}%)`}}>{text}</span>
      </span>
    );
  }
  if (anim === 'slide-left') {
    const p = ramp(frame, delay, delay + 10, EASE_OUT);
    return <span style={{...base, transform: `translateX(${(1 - p) * -80}px)`, opacity: p, filter: `blur(${(1 - p) * 10}px)`}}>{text}</span>;
  }
  const p = ramp(frame, delay, delay + 10);
  return <span style={{...base, opacity: p, filter: `blur(${(1 - p) * 14}px)`, transform: `scale(${1.15 - 0.15 * p})`}}>{text}</span>;
};
