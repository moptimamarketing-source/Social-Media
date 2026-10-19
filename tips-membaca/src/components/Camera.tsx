import React, {createContext, useContext} from 'react';
import {AbsoluteFill} from 'remotion';
import {EIO, lerp, shakeAt, useT} from '../lib/time';

export type Cam = {zoom: number; x: number; y: number; rotY: number; rotX: number};
export type CamKey = Partial<Cam> & {t: number; ease?: 'io' | 'cut'};
const BASE: Cam = {zoom: 1, x: 0, y: 0, rotY: 0, rotX: 0};

/** Interpolates camera keys (absolute seconds). Missing fields carry over from the previous key. */
export const camAt = (keys: CamKey[], t: number): Cam => {
  let prev: Cam = {...BASE, ...keys[0]};
  let prevT = keys[0].t;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    const next: Cam = {...prev, ...k};
    if (t < k.t) {
      if (k.ease === 'cut') return prev;
      const p = EIO(Math.min(1, Math.max(0, (t - prevT) / (k.t - prevT))));
      return {zoom: lerp(prev.zoom, next.zoom, p), x: lerp(prev.x, next.x, p), y: lerp(prev.y, next.y, p), rotY: lerp(prev.rotY, next.rotY, p), rotX: lerp(prev.rotX, next.rotX, p)};
    }
    prev = next;
    prevT = k.t;
  }
  return prev;
};

const CamCtx = createContext<Cam>(BASE);
export const useCam = () => useContext(CamCtx);

/** Virtual camera for a scene: keys drive zoom/pan/orbit, `shakes` add impact jolts. */
export const Stage: React.FC<{keys: CamKey[]; shakes?: {t: number; amp: number}[]; children: React.ReactNode}> = ({keys, shakes = [], children}) => {
  const {t} = useT();
  const c = camAt(keys, t);
  const sx = shakes.reduce((a, s) => a + shakeAt(t, s.t, s.amp), 0);
  const sy = shakes.reduce((a, s) => a + shakeAt(t + 0.013, s.t, s.amp * 0.7), 0);
  return (
    <CamCtx.Provider value={{...c, x: c.x + sx, y: c.y + sy}}>
      <AbsoluteFill style={{overflow: 'hidden'}}>{children}</AbsoluteFill>
    </CamCtx.Provider>
  );
};

/** Parallax layer: depth 0 = fixed (far), 1 = moves fully with the camera, >1 = foreground. */
export const Layer: React.FC<{depth: number; children: React.ReactNode; style?: React.CSSProperties}> = ({depth, children, style}) => {
  const c = useCam();
  const z = 1 + (c.zoom - 1) * depth;
  return (
    <AbsoluteFill
      style={{
        transformOrigin: '540px 960px',
        transform: `perspective(1800px) translate(${-c.x * depth}px, ${-c.y * depth}px) scale(${z}) rotateY(${c.rotY * depth}deg) rotateX(${c.rotX * depth}deg)`,
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Absolutely positions children centred on (x, y). */
export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', transformStyle: 'preserve-3d', ...style}}>{children}</div>
);
