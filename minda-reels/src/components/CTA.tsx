import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {EASE_OUT, ramp, springAt, SPRING_ELASTIC} from '../lib/anim';

type Item = {t: number; icon: string; label: string; primary?: boolean};

const Pill: React.FC<{item: Item; local: number}> = ({item, local}) => {
  const {fps} = useVideoConfig();
  const s = springAt(local, fps, 0, SPRING_ELASTIC);
  // a little "tap": press down then release, with a ripple
  const press = local > 10 && local < 18 ? Math.sin(((local - 10) / 8) * Math.PI) * 0.07 : 0;
  const ripple = interpolate(local, [10, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});
  const beat = item.icon === '❤️' && local > 12 ? 1 + Math.max(0, Math.sin((local - 12) / 3)) * 0.12 : 1;
  if (local < 0) return <div style={{flex: item.primary ? '1 1 100%' : '1 1 0', height: 112}} />;
  return (
    <div style={{flex: item.primary ? '1 1 100%' : '1 1 0', position: 'relative', height: 112, borderRadius: 999, overflow: 'hidden',
      background: item.primary ? C.yellow : C.white, color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      transform: `scale(${s * (1 - press)}) rotate(${(1 - s) * (item.primary ? 4 : -6)}deg)`, boxShadow: `0 8px 0 ${C.navyDeep}`}}>
      <div style={{position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: item.primary ? 'rgba(255,255,255,.5)' : 'rgba(255,210,63,.45)',
        transform: `scale(${ripple * 2})`, opacity: 1 - ripple}} />
      <span style={{fontFamily: F.emoji, fontSize: 54, transform: `scale(${beat})`}}>{item.icon}</span>
      <span style={{fontFamily: F.display, fontSize: item.primary ? 62 : 60, lineHeight: 1, paddingTop: 8, whiteSpace: 'nowrap'}}>{item.label}</span>
    </div>
  );
};

/** Branded end card: headline, then Like → Komen → Follow, one at a time. */
export const CTA: React.FC<{start: number; headline: string; items: Item[]}> = ({start, headline, items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f0 = Math.round(start * fps);
  const local = frame - f0;
  if (local < 0) return null;
  const panel = springAt(local, fps, 0, {damping: 15, stiffness: 260, mass: 0.7});
  const head = ramp(local, 8, 18);
  return (
    <div style={{position: 'absolute', left: 50, width: 980, top: 1080, transform: `translateY(${(1 - panel) * 520}px) rotate(${(1 - panel) * 4 - 1}deg)`}}>
      <div style={{background: C.navy, borderRadius: 48, padding: '34px 36px 40px', border: `6px solid ${C.yellow}`, boxShadow: '0 30px 60px rgba(0,0,0,.5)'}}>
        <div style={{fontFamily: F.display, fontSize: 64, lineHeight: 1.05, color: C.white, textAlign: 'center', marginBottom: 26,
          clipPath: `inset(0 ${100 - head * 100}% 0 0)`}}>
          {headline.replace('?', '')}<span style={{color: C.yellow}}>?</span>
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 22}}>
          {items.map((it, i) => (
            <Pill key={i} item={it} local={frame - Math.round(it.t * fps)} />
          ))}
        </div>
      </div>
    </div>
  );
};
