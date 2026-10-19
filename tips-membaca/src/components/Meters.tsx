import React from 'react';
import {C, F} from '../theme';

/** Vertical confidence gauge, level 0..1. */
export const ConfidenceMeter: React.FC<{level: number; label?: string}> = ({level, label = 'YAKIN'}) => {
  const h = 520;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
      <div style={{fontFamily: F.display, fontSize: 50, color: C.yellow, textShadow: `0 4px 0 ${C.navyDeep}`}}>{Math.round(level * 100)}%</div>
      <div style={{position: 'relative', width: 96, height: h, borderRadius: 50, background: 'rgba(5,15,44,0.6)', border: `6px solid ${C.white}`, overflow: 'hidden',
        boxShadow: '0 18px 30px rgba(0,0,0,0.35), inset 0 0 0 6px rgba(255,255,255,0.08)'}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${level * 100}%`, background: `linear-gradient(0deg, ${C.orange}, ${C.yellow})`,
          boxShadow: 'inset 10px 0 0 rgba(255,255,255,0.35)'}} />
        {[0.25, 0.5, 0.75].map((k) => (
          <div key={k} style={{position: 'absolute', left: 0, width: 30, bottom: `${k * 100}%`, height: 5, background: 'rgba(255,255,255,0.6)'}} />
        ))}
      </div>
      <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: C.white}}>{label}</div>
    </div>
  );
};

/** Horizontal progress bar with label. */
export const ProgressBar: React.FC<{level: number; label: string; width?: number}> = ({level, label, width = 760}) => (
  <div style={{width, background: 'rgba(5,15,44,0.7)', borderRadius: 30, padding: '16px 22px', border: `5px solid ${C.white}`, boxShadow: '0 16px 30px rgba(0,0,0,0.35)'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.sans, fontWeight: 800, fontSize: 30, color: C.white, letterSpacing: 2, marginBottom: 10}}>
      <span>{label}</span><span style={{color: C.yellow}}>{Math.round(level * 100)}%</span>
    </div>
    <div style={{height: 34, borderRadius: 20, background: 'rgba(255,255,255,0.15)', overflow: 'hidden'}}>
      <div style={{width: `${level * 100}%`, height: '100%', borderRadius: 20, background: `linear-gradient(90deg, ${C.yellow}, ${C.orange})`,
        boxShadow: 'inset 0 6px 0 rgba(255,255,255,0.35)'}} />
    </div>
  </div>
);
