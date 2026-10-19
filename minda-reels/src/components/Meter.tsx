import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {springAt, SPRING_ELASTIC} from '../lib/anim';

/** CONFIDENCE ▰▰▰▰▰ — segments fill one by one, then a "+1" floats up. Times are frames local to the parent. */
export const Meter: React.FC<{label: string; fillFrom: number; plusAt: number; segments?: number}> = ({label, fillFrom, plusAt, segments = 5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const step = Math.max(4, (plusAt - fillFrom) / segments);
  const plus = springAt(frame, fps, plusAt, SPRING_ELASTIC);
  const plusRise = interpolate(frame, [plusAt, plusAt + 30], [0, -40], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 18, position: 'relative'}}>
      <span style={{fontFamily: F.sans, fontWeight: 800, fontSize: 30, color: C.white, letterSpacing: 3}}>{label}</span>
      <div style={{display: 'flex', gap: 8}}>
        {Array.from({length: segments}, (_, i) => {
          const s = springAt(frame, fps, fillFrom + i * step, {damping: 10, stiffness: 260});
          return (
            <div key={i} style={{width: 46, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}>
              <div style={{width: '100%', height: '100%', background: i === segments - 1 ? C.orange : C.yellow, transform: `scaleX(${s})`, transformOrigin: 'left'}} />
            </div>
          );
        })}
      </div>
      <span style={{width: 84, fontFamily: F.display, fontSize: 52, lineHeight: 1, color: C.yellow,
        transform: `translateY(${plusRise * 0.25}px) scale(${plus})`, textShadow: '0 4px 0 rgba(0,0,0,.35)'}}>+1</span>
    </div>
  );
};
