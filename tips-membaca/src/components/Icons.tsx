import React from 'react';
import {C} from '../theme';

type P = {size?: number; style?: React.CSSProperties};
const shadow = 'drop-shadow(0 14px 18px rgba(0,0,0,0.35))';

export const Pencil: React.FC<P> = ({size = 220, style}) => (
  <svg width={size} height={size * 0.28} viewBox="0 0 250 70" style={{filter: shadow, overflow: 'visible', ...style}}>
    <defs>
      <linearGradient id="pc-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE47A" /><stop offset="0.5" stopColor={C.yellow} /><stop offset="1" stopColor={C.yellowDeep} /></linearGradient>
    </defs>
    <rect x="40" y="10" width="170" height="50" rx="6" fill="url(#pc-body)" />
    <rect x="40" y="10" width="170" height="10" fill="#fff" opacity="0.35" />
    <rect x="200" y="10" width="34" height="50" rx="6" fill="#FF9AA8" />
    <rect x="188" y="10" width="16" height="50" fill="#C9CED8" />
    <path d="M40 10 L4 35 L40 60 Z" fill="#F2D2A9" />
    <path d="M16 27 L4 35 L16 43 Z" fill={C.ink} />
  </svg>
);

export const Star: React.FC<P & {color?: string}> = ({size = 80, color = C.yellow, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: shadow, ...style}}>
    <defs><radialGradient id={`st-${color}`} cx="40%" cy="35%"><stop offset="0" stopColor="#FFF6C7" /><stop offset="1" stopColor={color} /></radialGradient></defs>
    <path d="M50 4 L62 36 L96 38 L69 59 L79 93 L50 73 L21 93 L31 59 L4 38 L38 36 Z" fill={`url(#st-${color})`} stroke={C.yellowDeep} strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

export const Sparkle: React.FC<P & {color?: string}> = ({size = 60, color = '#FFFFFF', style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: `drop-shadow(0 0 10px ${color})`, ...style}}>
    <path d="M50 0 C54 36 64 46 100 50 C64 54 54 64 50 100 C46 64 36 54 0 50 C36 46 46 36 50 0 Z" fill={color} />
  </svg>
);

export const Heart: React.FC<P & {color?: string}> = ({size = 120, color = C.red, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: shadow, ...style}}>
    <defs><radialGradient id={`ht-${color}`} cx="35%" cy="30%"><stop offset="0" stopColor="#FFB3B5" /><stop offset="1" stopColor={color} /></radialGradient></defs>
    <path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C40 8 46 14 50 22 C54 14 60 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88 Z" fill={`url(#ht-${color})`} />
    <ellipse cx="30" cy="28" rx="10" ry="6" fill="#fff" opacity="0.6" transform="rotate(-30 30 28)" />
  </svg>
);

export const ChatBubble: React.FC<P & {color?: string}> = ({size = 120, color = C.white, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: shadow, ...style}}>
    <path d="M14 18 H86 Q94 18 94 26 V62 Q94 70 86 70 H44 L24 88 V70 H14 Q6 70 6 62 V26 Q6 18 14 18 Z" fill={color} />
    <circle cx="32" cy="44" r="6" fill={C.navy} /><circle cx="50" cy="44" r="6" fill={C.navy} /><circle cx="68" cy="44" r="6" fill={C.navy} />
  </svg>
);

export const ShareArrow: React.FC<P & {color?: string}> = ({size = 120, color = C.white, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: shadow, ...style}}>
    <path d="M58 10 L94 44 L58 78 V58 C34 58 18 66 6 88 C10 56 26 34 58 30 Z" fill={color} />
  </svg>
);

export const Key: React.FC<P> = ({size = 260, style}) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 260 130" style={{filter: 'drop-shadow(0 0 24px rgba(255,210,63,0.8)) drop-shadow(0 16px 18px rgba(0,0,0,0.4))', ...style}}>
    <defs><linearGradient id="key-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF0A8" /><stop offset="0.5" stopColor={C.yellow} /><stop offset="1" stopColor={C.yellowDeep} /></linearGradient></defs>
    <circle cx="60" cy="65" r="52" fill="url(#key-g)" stroke={C.yellowDark} strokeWidth="5" />
    <circle cx="60" cy="65" r="22" fill={C.navy} />
    <path d="M108 52 H244 V78 H226 V100 H204 V78 H186 V96 H166 V78 H108 Z" fill="url(#key-g)" stroke={C.yellowDark} strokeWidth="5" strokeLinejoin="round" />
    <rect x="112" y="55" width="130" height="6" fill="#fff" opacity="0.5" />
  </svg>
);

export const Atom: React.FC<P & {t: number}> = ({size = 120, t, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible', ...style}}>
    {[0, 60, 120].map((a, i) => (
      <g key={i} transform={`rotate(${a + t * 40} 50 50)`}>
        <ellipse cx="50" cy="50" rx="44" ry="16" fill="none" stroke={C.white} strokeWidth="4" />
        <circle cx={50 + 44 * Math.cos(t * 4 + i * 2)} cy={50 + 16 * Math.sin(t * 4 + i * 2)} r="6" fill={C.yellow} />
      </g>
    ))}
    <circle cx="50" cy="50" r="10" fill={C.yellow} />
  </svg>
);

export const Snail: React.FC<P> = ({size = 140, style}) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 140 105" style={{filter: shadow, ...style}}>
    <path d="M6 92 Q4 76 30 74 H104 Q132 74 134 92 Z" fill="#9FD8A0" />
    <path d="M110 76 Q116 52 122 40" stroke="#9FD8A0" strokeWidth="9" strokeLinecap="round" />
    <path d="M126 78 Q134 56 136 46" stroke="#9FD8A0" strokeWidth="7" strokeLinecap="round" />
    <circle cx="122" cy="38" r="6" fill={C.ink} /><circle cx="136" cy="44" r="5" fill={C.ink} />
    <circle cx="62" cy="52" r="40" fill={C.orange} />
    <path d="M62 52 m-28 0 a28 28 0 1 0 56 0 a20 20 0 1 0 -40 0 a12 12 0 1 0 24 0" fill="none" stroke="#B85A00" strokeWidth="6" />
  </svg>
);

export const CheckBadge: React.FC<P & {ok: boolean}> = ({size = 130, ok, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: shadow, ...style}}>
    <circle cx="50" cy="50" r="46" fill={ok ? C.green : C.red} stroke="#fff" strokeWidth="6" />
    {ok ? <path d="M28 52 L44 67 L73 35" fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      : <path d="M33 33 L67 67 M67 33 L33 67" stroke="#fff" strokeWidth="11" strokeLinecap="round" />}
  </svg>
);

export const StressCloud: React.FC<P> = ({size = 170, style}) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 170 120" style={{filter: shadow, ...style}}>
    <path d="M40 100 Q8 100 10 74 Q8 50 34 48 Q38 18 70 20 Q92 4 114 22 Q150 18 152 52 Q168 66 154 88 Q148 104 120 100 Z" fill="#4A5578" />
    <path d="M44 66 q8 -12 16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="#C8D0E6" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

export const Bolt: React.FC<P> = ({size = 90, style}) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 60 84" style={{filter: shadow, ...style}}>
    <path d="M36 2 L6 48 H28 L20 82 L54 30 H32 Z" fill={C.yellow} stroke={C.yellowDark} strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

/** Big 3D wall clock with depth ring; hands driven by `t`. */
export const Clock3D: React.FC<P & {t: number; speed?: number}> = ({size = 600, t, speed = 1, style}) => {
  const sec = (t * speed * 6) % 360;
  const min = (t * speed * 0.6 + 40) % 360;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible', ...style}}>
      <defs>
        <radialGradient id="ck-face" cx="45%" cy="40%"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#D7DEEF" /></radialGradient>
        <linearGradient id="ck-rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A63C9" /><stop offset="1" stopColor="#071640" /></linearGradient>
      </defs>
      <circle cx="104" cy="110" r="96" fill="#020816" opacity="0.5" />
      <circle cx="100" cy="104" r="96" fill="#061233" />
      <circle cx="100" cy="100" r="96" fill="url(#ck-rim)" />
      <circle cx="100" cy="100" r="82" fill="url(#ck-face)" />
      {Array.from({length: 12}, (_, i) => (
        <rect key={i} x="98" y="24" width="4" height={i % 3 === 0 ? 14 : 8} rx="2" fill={C.navy} transform={`rotate(${i * 30} 100 100)`} />
      ))}
      <rect x="96" y="52" width="8" height="52" rx="4" fill={C.navy} transform={`rotate(${min} 100 100)`} />
      <rect x="98.5" y="32" width="3" height="76" rx="1.5" fill={C.red} transform={`rotate(${sec} 100 100)`} />
      <circle cx="100" cy="100" r="7" fill={C.yellow} stroke={C.navy} strokeWidth="2" />
      <ellipse cx="72" cy="58" rx="34" ry="14" fill="#fff" opacity="0.5" transform="rotate(-25 72 58)" />
    </svg>
  );
};

export const ArrowDown: React.FC<P> = ({size = 260, style}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{filter: shadow, overflow: 'visible', ...style}}>
    <path d="M8 18 L44 52 L64 36 L100 84" fill="none" stroke="#6E0F12" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" transform="translate(3 5)" />
    <path d="M8 18 L44 52 L64 36 L100 84" fill="none" stroke={C.red} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M78 90 L108 94 L104 64 Z" fill={C.red} stroke={C.red} strokeWidth="8" strokeLinejoin="round" />
  </svg>
);

/** Floating 3D question mark. */
export const QMark: React.FC<P & {color?: string}> = ({size = 160, color = C.yellow, style}) => {
  const layers = 10;
  return (
    <div style={{fontFamily: 'Baloo, sans-serif', fontSize: size, lineHeight: 1, color, position: 'relative',
      textShadow: Array.from({length: layers}, (_, i) => `0 ${i + 1}px 0 ${color === C.yellow ? '#B57E00' : '#0A1D52'}`).join(',') + ', 0 18px 24px rgba(0,0,0,.4)', ...style}}>?</div>
  );
};
