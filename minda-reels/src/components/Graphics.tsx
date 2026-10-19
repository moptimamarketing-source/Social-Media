import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, dropShadow, F} from '../theme';
import {EASE_OUT, exitAt, ramp, springAt, SPRING_ELASTIC, SPRING_POP, SPRING_SOFT} from '../lib/anim';

/** Visual metaphor for the negotiation: BACA 📚 ⇄ MAIN 😆 tugging back and forth. */
export const Metaphor: React.FC<{left: string; right: string}> = ({left, right}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const a = springAt(frame, fps, 0, SPRING_SOFT);
  const b = springAt(frame, fps, 4, SPRING_SOFT);
  const arrow = springAt(frame, fps, 9, SPRING_ELASTIC);
  const out = exitAt(frame, durationInFrames, 5);
  const tug = frame > 12 ? Math.sin((frame - 12) / 4.5) * 16 : 0;
  const pill = (txt: string, bg: string, fg: string): React.CSSProperties => ({
    fontFamily: F.display, fontSize: 60, lineHeight: 1, padding: '20px 30px 12px', borderRadius: 999, background: bg, color: fg,
    boxShadow: dropShadow, whiteSpace: 'nowrap', border: `5px solid ${C.navy}`,
  });
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: 1 - out, transform: `translateX(${tug}px) scale(${1 - out * 0.2})`}}>
      <div style={{...pill(left, C.white, C.navy), transform: `translateX(${(1 - a) * -300}px) rotate(${-4 + tug * 0.15}deg)`, opacity: a}}>{left}</div>
      <div style={{fontFamily: F.display, fontSize: 70, color: C.yellow, transform: `scale(${arrow}) scaleX(${tug >= 0 ? 1 : -1})`, textShadow: `0 5px 0 ${C.navy}`}}>⇄</div>
      <div style={{...pill(right, C.yellow, C.navy), transform: `translateX(${(1 - b) * 300}px) rotate(${4 + tug * 0.15}deg)`, opacity: b}}>{right}</div>
    </div>
  );
};

/** "5 MINIT" stopwatch: ring sweeps around while the label pops. */
export const Timer: React.FC<{label: string}> = ({label}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const s = springAt(frame, fps, 0, SPRING_POP);
  const out = exitAt(frame, durationInFrames, 4);
  const sweep = ramp(frame, 3, durationInFrames - 4, (x) => x);
  const r = 64;
  const c = 2 * Math.PI * r;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 22, background: C.navy, padding: '18px 36px 18px 22px', borderRadius: 999,
      border: `5px solid ${C.yellow}`, boxShadow: dropShadow, transform: `scale(${s * (1 - out * 0.4)}) rotate(-2deg)`, opacity: 1 - out}}>
      <svg width={160} height={160} viewBox="0 0 160 160">
        <circle cx={80} cy={80} r={r} fill={C.white} />
        <circle cx={80} cy={80} r={r} fill="none" stroke={C.yellow} strokeWidth={16} strokeDasharray={c} strokeDashoffset={c * sweep}
          transform="rotate(-90 80 80)" strokeLinecap="round" />
        <line x1={80} y1={80} x2={80 + 44 * Math.sin(sweep * Math.PI * 2)} y2={80 - 44 * Math.cos(sweep * Math.PI * 2)} stroke={C.navy} strokeWidth={8} strokeLinecap="round" />
        <circle cx={80} cy={80} r={9} fill={C.orange} />
        <rect x={68} y={2} width={24} height={14} rx={4} fill={C.yellow} />
      </svg>
      <div style={{fontFamily: F.display, fontSize: 84, lineHeight: 1, color: C.white, paddingTop: 10}}>
        <span style={{color: C.yellow}}>{label.split(' ')[0]}</span> {label.split(' ').slice(1).join(' ')}
      </div>
    </div>
  );
};

/** Pulsing ring that draws itself around a detail (e.g. the letter on the page). */
export const CalloutRing: React.FC<{radius: number}> = ({radius}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const draw = ramp(frame, 0, 10, EASE_OUT);
  const out = exitAt(frame, durationInFrames, 4);
  const pulse = 1 + Math.max(0, Math.sin(frame / 4)) * 0.06;
  const r = radius;
  const c = 2 * Math.PI * r;
  return (
    <svg width={r * 2 + 40} height={r * 2 + 40} style={{overflow: 'visible', opacity: 1 - out, transform: `scale(${pulse}) rotate(-80deg)`}}>
      <circle cx={r + 20} cy={r + 20} r={r} fill="none" stroke={C.navy} strokeWidth={18} strokeDasharray={c} strokeDashoffset={c * (1 - draw)} strokeLinecap="round" opacity={0.6} />
      <circle cx={r + 20} cy={r + 20} r={r} fill="none" stroke={C.yellow} strokeWidth={10} strokeDasharray={c} strokeDashoffset={c * (1 - draw)} strokeLinecap="round" />
    </svg>
  );
};

/** Small story-progress pill: ● ● ○ ○ 02 PUJUK. Grows and turns yellow briefly on each new step. */
export const ProgressTracker: React.FC<{steps: {t: number; label: string}[]; t: number; visible: [number, number]}> = ({steps, t, visible}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const idx = steps.reduce((acc, s, i) => (t >= s.t ? i : acc), -1);
  if (idx < 0 || t < visible[0] || t >= visible[1]) return null;
  const since = frame - Math.round(steps[idx].t * fps);
  const appear = springAt(frame, fps, Math.round(visible[0] * fps), SPRING_POP);
  const hiOut = interpolate(since, [40, 52], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bump = springAt(since, fps, 0, SPRING_ELASTIC);
  const hide = interpolate(t, [visible[1] - 0.15, visible[1]], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hi = hiOut;
  const scale = (1 + 0.22 * hi) * appear * hide;
  const label = `${String(idx + 1).padStart(2, '0')} ${steps[idx].label}`;
  return (
    <div style={{transformOrigin: 'left center', transform: `scale(${scale}) rotate(${-2 * hi}deg)`, display: 'inline-flex', alignItems: 'center', gap: 14,
      background: hi > 0.5 ? C.yellow : C.navy, color: hi > 0.5 ? C.navy : C.white, padding: '12px 22px 10px 18px', borderRadius: 999,
      border: `4px solid ${hi > 0.5 ? C.navy : C.yellow}`, boxShadow: dropShadow}}>
      <div style={{display: 'flex', gap: 7}}>
        {steps.map((_, i) => (
          <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: i <= idx ? (hi > 0.5 ? C.navy : C.yellow) : 'rgba(255,255,255,0.35)',
            transform: i === idx ? `scale(${0.6 + 0.4 * bump})` : undefined}} />
        ))}
      </div>
      <span style={{fontFamily: F.sans, fontWeight: 800, fontSize: 30, letterSpacing: 2, transform: `translateY(${(1 - bump) * 12}px)`, opacity: Math.min(1, bump * 1.4)}}>{label}</span>
    </div>
  );
};
