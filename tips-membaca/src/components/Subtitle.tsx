import React from 'react';
import {C, F, Z} from '../theme';
import {captions} from '../data/captions';
import {lerp, prog, sp, useT} from '../lib/time';

/**
 * Word-by-word subtitles: each word pops in as it is spoken, keywords turn
 * yellow; white text, navy outline, max two lines, on its own band so it never
 * collides with the headline or the illustration.
 */
export const Subtitle: React.FC = () => {
  const {t, f, fps} = useT();
  const c = captions.find((x) => t >= x.start && t < x.end);
  if (!c) return null;
  const enter = prog(t, c.start, c.start + 0.15);
  const exit = prog(t, c.end - 0.1, c.end);
  const lines: (typeof c.words)[] = [[]];
  c.words.forEach((w) => {
    if (w.br) lines.push([]);
    lines[lines.length - 1].push(w);
  });
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: Z.subY, transform: `translateY(-50%) translateY(${(1 - enter) * 14}px)`, opacity: enter * (1 - exit),
      display: 'flex', justifyContent: 'center'}}>
      <div style={{background: 'rgba(5,15,44,0.55)', borderRadius: 34, padding: '14px 30px 12px', boxShadow: '0 12px 30px rgba(0,0,0,0.25)', textAlign: 'center'}}>
        {lines.map((ln, i) => (
          <div key={i} style={{fontFamily: F.sans, fontWeight: 800, fontSize: 60, lineHeight: 1.18, whiteSpace: 'nowrap'}}>
            {ln.map((w, j) => {
              const s = sp(f, fps, w.t - 0.03, {damping: 12, stiffness: 320, mass: 0.5});
              const on = t >= w.t - 0.03;
              const pop = w.key ? 1 + 0.18 * Math.sin(Math.min(1, s) * Math.PI) : 1;
              return (
                <span key={j} style={{display: 'inline-block', margin: '0 0.13em', color: w.key ? C.yellow : C.white, opacity: on ? Math.min(1, s * 1.5) : 0,
                  transform: `translateY(${(1 - Math.min(1, s)) * 18}px) scale(${lerp(0.7, 1, Math.min(1, s)) * pop})`,
                  WebkitTextStroke: `10px ${C.navyDeep}`, paintOrder: 'stroke fill', textShadow: '0 6px 12px rgba(0,0,0,0.4)'}}>{w.w}</span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
