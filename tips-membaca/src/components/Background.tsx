import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {useT, wobble} from '../lib/time';
import {useCam} from './Camera';

type Variant = 'navy' | 'dim' | 'bright' | 'warm' | 'urgent';

const PALETTE: Record<Variant, {base: [string, string]; blobs: [string, string, string]; dots: string}> = {
  navy: {base: ['#13307A', C.navyDeep], blobs: ['#2F62D8', '#FFD23F', '#1B3F9A'], dots: 'rgba(255,255,255,0.07)'},
  dim: {base: ['#24345E', '#0A1330'], blobs: ['#3B4C7A', '#5A6C99', '#1A2547'], dots: 'rgba(255,255,255,0.04)'},
  bright: {base: ['#2F62D8', '#0F2A6E'], blobs: ['#7FB0FF', '#FFD23F', '#FFE38A'], dots: 'rgba(255,255,255,0.10)'},
  warm: {base: ['#FFB547', '#E07B12'], blobs: ['#FFE18A', '#FFF3C9', '#F59A2A'], dots: 'rgba(255,255,255,0.12)'},
  urgent: {base: ['#1A2B66', '#040A1E'], blobs: ['#E5484D', '#2F62D8', '#FF8A1F'], dots: 'rgba(255,255,255,0.05)'},
};

/** Animated gradient backdrop: drifting colour blobs, parallax dot grid, optional light rays, vignette. */
export const Background: React.FC<{variant?: Variant; rays?: boolean; raysColor?: string}> = ({variant = 'navy', rays = false, raysColor = 'rgba(255,210,63,0.16)'}) => {
  const {t} = useT();
  const cam = useCam();
  const p = PALETTE[variant];
  const blob = (color: string, x: number, y: number, r: number, ph: number, op: number) => (
    <div style={{position: 'absolute', left: x + wobble(t, 0.06, 90, ph) - r, top: y + wobble(t, 0.05, 120, ph + 1) - r, width: r * 2, height: r * 2,
      borderRadius: '50%', background: `radial-gradient(circle, ${color} 0%, transparent 68%)`, opacity: op}} />
  );
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 90% at 50% 35%, ${p.base[0]} 0%, ${p.base[1]} 75%)`, overflow: 'hidden'}}>
      {blob(p.blobs[0], 200, 400, 600, 0, 0.55)}
      {blob(p.blobs[1], 900, 1300, 520, 2, 0.28)}
      {blob(p.blobs[2], 700, 200, 480, 4, 0.5)}
      {rays ? (
        <div style={{position: 'absolute', left: -460, top: -40, width: 2000, height: 2000, transform: `rotate(${t * 6}deg)`,
          background: `repeating-conic-gradient(from 0deg at 50% 50%, ${raysColor} 0deg 7deg, transparent 7deg 20deg)`,
          maskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 55%)', WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 55%)'}} />
      ) : null}
      <div style={{position: 'absolute', inset: -200, backgroundImage: `radial-gradient(${p.dots} 2.4px, transparent 2.6px)`, backgroundSize: '46px 46px',
        transform: `translate(${-cam.x * 0.2}px, ${-cam.y * 0.2 + t * 6}px)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(110% 80% at 50% 45%, transparent 55%, rgba(2,6,20,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

/** Drifting sparkles / dust for depth. */
export const Particles: React.FC<{count?: number; color?: string; seed?: number; rise?: number; size?: number}> = ({count = 26, color = C.yellow, seed = 1, rise = 40, size = 8}) => {
  const {t} = useT();
  const rnd = (i: number, k: number) => {
    const v = Math.sin(i * 127.1 + k * 311.7 + seed * 74.7) * 43758.5453;
    return v - Math.floor(v);
  };
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}, (_, i) => {
        const x = rnd(i, 1) * 1080;
        const y = ((rnd(i, 2) * 1920 - t * rise * (0.5 + rnd(i, 3))) % 1920 + 1920) % 1920;
        const s = size * (0.4 + rnd(i, 4));
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + rnd(i, 5) * 2) + i));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: color, opacity: tw * 0.8,
          boxShadow: `0 0 ${s * 2}px ${color}`}} />;
      })}
    </AbsoluteFill>
  );
};
