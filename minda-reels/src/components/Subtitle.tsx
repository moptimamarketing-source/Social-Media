import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F, outline} from '../theme';
import {EASE_OUT, springAt} from '../lib/anim';
import type {Caption} from '../data/captions';
import {SUBTITLE_Y} from '../lib/safeArea';

type Token = {text: string; key: boolean; at: number; br: boolean};

const tokenize = (c: Caption): Token[] => {
  const raw = c.text.split(' ');
  const words = raw.filter((w) => w !== '/');
  const span = Math.max(0.2, c.end - c.start - 0.25);
  let wi = 0;
  const out: Token[] = [];
  let br = false;
  for (const r of raw) {
    if (r === '/') {
      br = true;
      continue;
    }
    const key = /^\*.*\*[,.!?…]*$/.test(r);
    const at = c.words?.[wi] ?? c.start + (span * wi) / Math.max(1, words.length);
    out.push({text: r.replace(/\*/g, ''), key, at, br});
    br = false;
    wi++;
  }
  return out;
};

const Word: React.FC<{tok: Token; t: number; host: boolean}> = ({tok, t, host}) => {
  const {fps} = useVideoConfig();
  const f = Math.round((t - tok.at) * fps);
  if (!tok.key) return <span style={{display: 'inline-block', margin: '0 0.14em'}}>{tok.text}</span>;
  const spoken = f >= 0;
  const pop = spoken ? springAt(f, fps, 0, {damping: 9, stiffness: 300, mass: 0.6}) : 0;
  const scale = 1 + 0.16 * Math.sin(Math.min(1, pop) * Math.PI) * (f < 12 ? 1 : 0);
  if (host) {
    const sweep = interpolate(f, [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});
    return (
      <span style={{display: 'inline-block', position: 'relative', margin: '0 0.14em', transform: `scale(${scale}) rotate(${-1.5 * sweep}deg)`}}>
        <span style={{position: 'absolute', left: -12, right: -12, top: '8%', bottom: '2%', background: C.yellow, borderRadius: 14,
          transform: `scaleX(${sweep})`, transformOrigin: 'left', boxShadow: `0 6px 0 ${C.navyDeep}`}} />
        <span style={{position: 'relative', color: sweep > 0.5 ? C.navy : C.white, WebkitTextStroke: sweep > 0.5 ? '0px' : undefined}}>{tok.text}</span>
      </span>
    );
  }
  return (
    <span style={{display: 'inline-block', margin: '0 0.14em', color: spoken ? C.yellow : C.white, transform: `scale(${scale}) translateY(${-6 * Math.sin(Math.min(1, pop) * Math.PI)}px)`}}>
      {tok.text}
    </span>
  );
};

/** Premium subtitles: short chunks, keyword pops yellow on the beat, sits in the safe zone. */
export const Subtitle: React.FC<{captions: Caption[]}> = ({captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const c = captions.find((x) => t >= x.start && t < x.end);
  if (!c) return null;
  const local = frame - Math.round(c.start * fps);
  const len = Math.round((c.end - c.start) * fps);
  const enter = springAt(local, fps, 0, {damping: 14, stiffness: 260, mass: 0.6});
  const exit = interpolate(local, [len - 3, len], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const host = c.style === 'host';
  const toks = tokenize(c);
  const lines: Token[][] = [[]];
  toks.forEach((tk) => {
    if (tk.br) lines.push([]);
    lines[lines.length - 1].push(tk);
  });
  return (
    <div style={{position: 'absolute', left: 70, width: 900, top: SUBTITLE_Y, transform: `translateY(-50%) translateY(${(1 - enter) * 26}px) scale(${(0.9 + 0.1 * enter) * (1 - exit * 0.05)})`,
      opacity: Math.min(1, enter * 1.5) * (1 - exit), textAlign: 'center'}}>
      {lines.map((ln, i) => (
        <div key={i} style={{fontFamily: F.sans, fontWeight: 800, fontSize: 68, lineHeight: 1.18, color: C.white, letterSpacing: 0.5,
          ...outline(11, C.navyDeep), textShadow: '0 7px 16px rgba(0,0,0,0.45)'}}>
          {ln.map((tk, j) => (
            <Word key={j} tok={tk} t={t} host={host} />
          ))}
        </div>
      ))}
    </div>
  );
};
