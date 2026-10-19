import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {exitAt, springAt, SPRING_POP} from '../lib/anim';
import type {Vec} from '../lib/camera';

/**
 * Comic speech bubble that grows out of its tail. `tail` is the absolute point
 * (same space as the bubble centre `at`) the tail should point to.
 */
export const SpeechBubble: React.FC<{text: string; at: Vec; tail: Vec; width?: number; size?: 'sm' | 'lg'}> = ({
  text, at, tail, width, size = 'sm',
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const s = springAt(frame, fps, 0, SPRING_POP);
  const out = exitAt(frame, durationInFrames, 4);
  const textIn = interpolate(frame, [3, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fontSize = size === 'lg' ? 74 : 62;
  const w = width ?? (size === 'lg' ? 760 : 380);
  const h = size === 'lg' ? 230 : 130;
  // tail relative to the bubble centre
  const tx = tail[0] - at[0];
  const ty = tail[1] - at[1];
  const baseX = Math.max(-w / 2 + 60, Math.min(w / 2 - 60, tx * 0.35));
  const originX = 50 + (baseX / w) * 100;
  const scale = interpolate(s, [0, 1], [0, 1]) * (1 - out * 0.5);
  const parts = text.split(/(PENATLAH|[A-Z]{3,}[!?]*)/g);
  return (
    <div style={{position: 'absolute', left: at[0] - w / 2, top: at[1] - h / 2, width: w, height: h,
      transform: `scale(${scale}) rotate(${(1 - s) * -6}deg)`, transformOrigin: `${originX}% 100%`, opacity: 1 - out}}>
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 14px 18px rgba(0,0,0,.35))'}}>
        <path d={`M ${w / 2 + baseX - 34} ${h - 8} L ${w / 2 + tx} ${h / 2 + ty} L ${w / 2 + baseX + 34} ${h - 8} Z`} fill={C.white} stroke={C.navy} strokeWidth={7} strokeLinejoin="round" />
        <rect x={0} y={0} width={w} height={h} rx={h / 2.2} fill={C.white} stroke={C.navy} strokeWidth={7} />
        <rect x={w / 2 + baseX - 30} y={h - 14} width={60} height={12} fill={C.white} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '0 30px', fontFamily: F.display, fontSize, lineHeight: 1.0, color: C.navy, opacity: textIn, transform: `translateY(${(1 - textIn) * 10 + 4}px)`}}>
        <span>
          {parts.map((p, i) =>
            size === 'lg' && /^(PENATLAH|[A-Z]{3,}[!?]*)$/.test(p) ? (
              <span key={i} style={{color: C.red}}>{p}</span>
            ) : (
              <span key={i}>{p}</span>
            ),
          )}
        </span>
      </div>
    </div>
  );
};
