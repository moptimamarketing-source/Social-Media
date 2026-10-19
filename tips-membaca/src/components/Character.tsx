import React from 'react';
import {C} from '../theme';

export type Who = 'kid' | 'mom' | 'dad';
export type Expr = 'happy' | 'smile' | 'excited' | 'confused' | 'sad' | 'worried' | 'neutral' | 'proud';
export type Pose = 'desk' | 'book' | 'chin' | 'cheer' | 'thumbs' | 'wave' | 'rest';

type Props = {
  who: Who;
  expr: Expr;
  pose: Pose;
  /** absolute seconds, drives blink / idle motion */
  t: number;
  /** -1..1 gaze */
  look?: [number, number];
  tilt?: number;
  drop?: number;
  width?: number;
  /** seed so two characters don't blink in sync */
  seed?: number;
  style?: React.CSSProperties;
};

type V = [number, number];

const LOOKS: Record<Who, {wrap: string; wrapShade: string; body: string; bodyShade: string; sleeve: string; sleeveShade: string; faceRx: number; faceRy: number; faceCy: number}> = {
  kid: {wrap: '#FFFFFF', wrapShade: '#CBD5EC', body: '#1E3C8F', bodyShade: '#0E2363', sleeve: '#E9EFFB', sleeveShade: '#9FB0D6', faceRx: 92, faceRy: 96, faceCy: 222},
  mom: {wrap: '#F7BE45', wrapShade: '#D9901B', body: '#16357F', bodyShade: '#0A1F57', sleeve: '#1E44A0', sleeveShade: '#10296A', faceRx: 84, faceRy: 94, faceCy: 214},
  dad: {wrap: '#1C1D26', wrapShade: '#000000', body: '#8FB6FF', bodyShade: '#5B87DA', sleeve: '#8FB6FF', sleeveShade: '#5B87DA', faceRx: 88, faceRy: 98, faceCy: 212},
};

// [elbowL, handL, elbowR, handR] in the 400×560 character box (L = viewer's left)
const POSES: Record<Pose, [V, V, V, V]> = {
  desk: [[92, 470], [160, 468], [308, 470], [240, 468]],
  rest: [[96, 480], [128, 545], [304, 480], [272, 545]],
  book: [[96, 470], [138, 410], [304, 470], [262, 410]],
  chin: [[120, 470], [168, 300], [308, 470], [240, 470]],
  cheer: [[66, 300], [70, 160], [334, 300], [330, 160]],
  thumbs: [[92, 470], [160, 470], [338, 420], [312, 330]],
  wave: [[92, 470], [160, 470], [338, 330], [352, 205]],
};

const SHOULDER_L: V = [118, 392];
const SHOULDER_R: V = [282, 392];

const Arm: React.FC<{s: V; e: V; h: V; sleeve: string; shade: string; thumb?: boolean}> = ({s, e, h, sleeve, shade, thumb}) => {
  const d = `M${s[0]} ${s[1]} Q${e[0]} ${e[1]} ${h[0]} ${h[1]}`;
  return (
    <g>
      <path d={d} stroke={shade} strokeWidth={50} fill="none" strokeLinecap="round" />
      <path d={d} stroke={sleeve} strokeWidth={42} fill="none" strokeLinecap="round" />
      <circle cx={h[0]} cy={h[1]} r={23} fill="url(#skin)" stroke={C.skinShade} strokeWidth={2} />
      {thumb ? <rect x={h[0] - 7} y={h[1] - 48} width={15} height={32} rx={7} fill="url(#skin)" stroke={C.skinShade} strokeWidth={2} /> : null}
    </g>
  );
};

const Brows: React.FC<{expr: Expr; cy: number}> = ({expr, cy}) => {
  // [left inner dy, left outer dy, right inner dy, right outer dy]
  const m: Record<Expr, [number, number, number, number]> = {
    happy: [-4, 2, -4, 2], smile: [0, 0, 0, 0], excited: [-8, -2, -8, -2], proud: [2, -4, 2, -4],
    confused: [-10, 4, 6, -2], sad: [-12, 6, -12, 6], worried: [-10, 4, -10, 4], neutral: [0, 0, 0, 0],
  };
  const [li, lo, ri, ro] = m[expr];
  const y = cy - 52;
  return (
    <g stroke="#3A2416" strokeWidth={7} strokeLinecap="round" fill="none">
      <path d={`M${150} ${y + lo} Q${165} ${y - 6 + (li + lo) / 2} ${182} ${y + li}`} />
      <path d={`M${218} ${y + ri} Q${235} ${y - 6 + (ri + ro) / 2} ${250} ${y + ro}`} />
    </g>
  );
};

const Mouth: React.FC<{expr: Expr; cy: number; who: Who}> = ({expr, cy, who}) => {
  const y = cy + 52;
  const lip = who === 'mom' ? '#C9475B' : '#8E2F2B';
  switch (expr) {
    case 'happy':
    case 'proud':
      return (
        <g>
          <path d={`M172 ${y - 4} Q200 ${y + 34} 228 ${y - 4} Q200 ${y + 6} 172 ${y - 4} Z`} fill={lip} />
          <path d={`M186 ${y + 12} Q200 ${y + 24} 214 ${y + 12} Q200 ${y + 8} 186 ${y + 12} Z`} fill="#F07C7C" />
        </g>
      );
    case 'excited':
      return (
        <g>
          <path d={`M168 ${y - 8} Q200 ${y + 46} 232 ${y - 8} Z`} fill={lip} />
          <path d={`M182 ${y + 16} Q200 ${y + 34} 218 ${y + 16} Q200 ${y + 10} 182 ${y + 16} Z`} fill="#F07C7C" />
          <rect x={180} y={y - 8} width={40} height={8} rx={3} fill="#fff" />
        </g>
      );
    case 'smile':
      return <path d={`M176 ${y} Q200 ${y + 20} 224 ${y}`} stroke={lip} strokeWidth={7} fill="none" strokeLinecap="round" />;
    case 'sad':
      return <path d={`M178 ${y + 14} Q200 ${y - 4} 222 ${y + 14}`} stroke={lip} strokeWidth={7} fill="none" strokeLinecap="round" />;
    case 'confused':
      return <path d={`M178 ${y + 8} Q188 ${y} 198 ${y + 8} T 222 ${y + 2}`} stroke={lip} strokeWidth={7} fill="none" strokeLinecap="round" />;
    case 'worried':
      return <path d={`M182 ${y + 8} Q192 ${y + 1} 200 ${y + 8} Q208 ${y + 14} 218 ${y + 6}`} stroke={lip} strokeWidth={7} fill="none" strokeLinecap="round" />;
    default:
      return <path d={`M184 ${y + 6} L216 ${y + 6}`} stroke={lip} strokeWidth={7} strokeLinecap="round" />;
  }
};

const Eyes: React.FC<{expr: Expr; cy: number; look: [number, number]; blink: number; who: Who}> = ({expr, cy, look, blink, who}) => {
  const y = cy - 12;
  const r = who === 'kid' ? 22 : 18;
  if (expr === 'excited' || (expr === 'happy' && who !== 'kid')) {
    return (
      <g stroke="#2A1A10" strokeWidth={8} fill="none" strokeLinecap="round">
        <path d={`M146 ${y + 6} Q165 ${y - 18} 184 ${y + 6}`} />
        <path d={`M216 ${y + 6} Q235 ${y - 18} 254 ${y + 6}`} />
      </g>
    );
  }
  const lid = expr === 'sad' ? 0.45 : expr === 'worried' ? 0.2 : 0;
  const close = Math.max(lid, blink);
  const lx = look[0] * 7;
  const ly = look[1] * 6 + (expr === 'sad' ? 6 : 0);
  const eye = (cx: number) => (
    <g>
      <ellipse cx={cx} cy={y} rx={r} ry={r * 1.12} fill="#fff" />
      <circle cx={cx + lx} cy={y + ly + 2} r={r * 0.68} fill="#3B2314" />
      <circle cx={cx + lx} cy={y + ly + 2} r={r * 0.36} fill="#120A05" />
      <circle cx={cx + lx - r * 0.25} cy={y + ly - r * 0.25} r={r * 0.24} fill="#fff" />
      <circle cx={cx + lx + r * 0.25} cy={y + ly + r * 0.25} r={r * 0.1} fill="#fff" />
      {close > 0 ? <rect x={cx - r - 2} y={y - r * 1.2} width={r * 2 + 4} height={r * 2.3 * close} fill="url(#skin)" /> : null}
      {who === 'mom' ? <path d={`M${cx - r} ${y - r * 0.9 + r * 2.1 * close} l-8 -6 M${cx + r} ${y - r * 0.9 + r * 2.1 * close} l8 -6`} stroke="#2A1A10" strokeWidth={4} strokeLinecap="round" /> : null}
    </g>
  );
  return (
    <g>
      {eye(165)}
      {eye(235)}
    </g>
  );
};

/**
 * 2.5D cartoon bust of a Malaysian family member (school-tudung girl, mum in
 * hijab, dad). Shaded with gradients for a soft 3D look; expression, pose,
 * gaze and blink are all props so scenes can act with it.
 */
export const Character: React.FC<Props> = ({who, expr, pose, t, look = [0, 0], tilt = 0, drop = 0, width = 520, seed = 0, style}) => {
  const L = LOOKS[who];
  const cyc = (t + seed * 1.37) % 3.4;
  const blink = cyc < 0.12 ? Math.sin((cyc / 0.12) * Math.PI) : 0;
  const bob = Math.sin((t + seed) * 2.4) * 3;
  const [eL, hL, eR, hR] = POPS(pose, t);
  const cy = L.faceCy;
  const handsOnTop = pose === 'cheer' || pose === 'chin' || pose === 'wave' || pose === 'thumbs' || pose === 'book';
  const arms = (
    <>
      <Arm s={SHOULDER_L} e={eL} h={hL} sleeve={L.sleeve} shade={L.sleeveShade} />
      <Arm s={SHOULDER_R} e={eR} h={hR} sleeve={L.sleeve} shade={L.sleeveShade} thumb={pose === 'thumbs'} />
    </>
  );
  const id = who;
  return (
    <svg width={width} height={width * 1.4} viewBox="0 0 400 560" style={{overflow: 'visible', filter: 'drop-shadow(0 22px 26px rgba(0,0,0,0.35))', ...style}}>
      <defs>
        <radialGradient id="skin" cx="42%" cy="35%" r="70%"><stop offset="0" stopColor="#FFE0C7" /><stop offset="0.6" stopColor={C.skin} /><stop offset="1" stopColor={C.skinShade} /></radialGradient>
        <linearGradient id={`wrap-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={L.wrap} /><stop offset="1" stopColor={L.wrapShade} /></linearGradient>
        <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={L.body} /><stop offset="1" stopColor={L.bodyShade} /></linearGradient>
      </defs>
      {/* torso */}
      <path d="M78 560 C 78 440 120 382 200 378 C 280 382 322 440 322 560 Z" fill={`url(#body-${id})`} />
      {who === 'dad' ? <path d="M160 382 L200 432 L240 382 L226 376 L200 404 L174 376 Z" fill="#fff" /> : null}
      {!handsOnTop ? arms : null}
      <g transform={`translate(0 ${bob + drop}) rotate(${tilt} 200 330)`}>
        {who === 'dad' ? (
          <g>
            <rect x={176} y={280} width={48} height={60} rx={18} fill={C.skinShade} />
            <ellipse cx={112} cy={cy + 8} rx={16} ry={24} fill="url(#skin)" />
            <ellipse cx={288} cy={cy + 8} rx={16} ry={24} fill="url(#skin)" />
          </g>
        ) : (
          <path d={who === 'kid'
            ? 'M200 92 C 300 92 336 160 334 232 C 333 296 330 336 356 388 C 330 430 262 442 200 442 C 138 442 70 430 44 388 C 70 336 67 296 66 232 C 64 160 100 92 200 92 Z'
            : 'M200 90 C 294 90 330 160 326 232 C 324 300 324 360 352 430 C 320 470 260 476 200 476 C 140 476 80 470 48 430 C 76 360 76 300 74 232 C 70 160 106 90 200 90 Z'}
          fill={`url(#wrap-${id})`} />
        )}
        <ellipse cx={200} cy={cy} rx={L.faceRx} ry={L.faceRy} fill="url(#skin)" />
        {who !== 'dad' ? (
          <>
            <ellipse cx={200} cy={cy - 4} rx={L.faceRx + 7} ry={L.faceRy + 9} fill="none" stroke={L.wrap} strokeWidth={14} />
            <ellipse cx={200} cy={cy - 4} rx={L.faceRx + 1} ry={L.faceRy + 3} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={4} />
            <path d={`M140 ${cy + 96} Q200 ${cy + 128} 260 ${cy + 96}`} stroke={L.wrapShade} strokeWidth={5} fill="none" opacity={0.6} />
          </>
        ) : (
          <>
            <path d={`M110 ${cy + 4} C 100 ${cy - 96} 150 ${cy - 124} 202 ${cy - 122} C 258 ${cy - 122} 302 ${cy - 92} 290 ${cy + 4} C 284 ${cy - 40} 276 ${cy - 56} 262 ${cy - 62} C 236 ${cy - 46} 190 ${cy - 44} 150 ${cy - 62} C 128 ${cy - 54} 116 ${cy - 34} 110 ${cy + 4} Z`} fill="#1C1D26" />
            <path d={`M150 ${cy - 100} Q200 ${cy - 118} 250 ${cy - 98}`} stroke="#3A3C4A" strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d={`M184 ${cy + 40} Q200 ${cy + 34} 216 ${cy + 40}`} stroke="#2A1D16" strokeWidth={6} strokeLinecap="round" fill="none" />
          </>
        )}
        <ellipse cx={150} cy={cy + 26} rx={17} ry={10} fill="#FF8E8E" opacity={expr === 'sad' ? 0.15 : 0.4} />
        <ellipse cx={250} cy={cy + 26} rx={17} ry={10} fill="#FF8E8E" opacity={expr === 'sad' ? 0.15 : 0.4} />
        <Eyes expr={expr} cy={cy} look={look} blink={blink} who={who} />
        <Brows expr={expr} cy={cy} />
        <path d={`M196 ${cy + 16} Q202 ${cy + 26} 208 ${cy + 18}`} stroke={C.skinShade} strokeWidth={5} fill="none" strokeLinecap="round" />
        <Mouth expr={expr} cy={cy} who={who} />
        <ellipse cx={170} cy={cy - 62} rx={30} ry={12} fill="#fff" opacity={0.22} transform={`rotate(-18 170 ${cy - 62})`} />
      </g>
      {pose === 'book' ? (
        <g transform="translate(0 6)">
          <path d="M110 368 L200 382 L290 368 L290 462 L200 476 L110 462 Z" fill={C.navy} />
          <path d="M118 362 L200 376 L200 466 L118 452 Z" fill="#FFFDF6" />
          <path d="M282 362 L200 376 L200 466 L282 452 Z" fill="#F3EEDF" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} stroke="#BAC6E3" strokeWidth={4}>
              <path d={`M132 ${386 + i * 16} L188 ${396 + i * 16}`} />
              <path d={`M212 ${396 + i * 16} L268 ${386 + i * 16}`} />
            </g>
          ))}
        </g>
      ) : null}
      {handsOnTop ? arms : null}
    </svg>
  );
};

/** Pose keyframe with small idle motion (waving hand, cheering bounce). */
function POPS(pose: Pose, t: number): [V, V, V, V] {
  const p = POSES[pose].map((v) => [...v] as V) as [V, V, V, V];
  if (pose === 'wave') {
    p[3][0] += Math.sin(t * 12) * 18;
  }
  if (pose === 'cheer') {
    const b = Math.sin(t * 9) * 10;
    p[1][1] += b;
    p[3][1] -= b;
  }
  return p;
}
