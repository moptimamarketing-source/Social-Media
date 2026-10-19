import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {camTransform, cameraAt, CamKey} from '../lib/camera';

/**
 * Applies the virtual camera (zoom + reframe) to its children. Children are
 * laid out in source-pixel space, so graphics placed inside "stick" to the
 * footage (world space) and punch in with it.
 */
export const PunchZoom: React.FC<{keys: CamKey[]; children: React.ReactNode}> = ({keys, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cam = cameraAt(keys, frame / fps);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', width: 1080, height: 1920, transformOrigin: '0 0', transform: camTransform(cam)}}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Whip-pan: horizontal motion blur + slide, peaking at `t`. Wraps everything that should whip. */
export const Whip: React.FC<{whips: {t: number; dur: number; dir?: 1 | -1}[]; children: React.ReactNode}> = ({whips, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const w = whips.find((x) => Math.abs(t - x.t) <= x.dur / 2);
  if (!w) return <>{children}</>;
  const p = (t - w.t) / (w.dur / 2); // -1 … 1
  const strength = 1 - Math.abs(p);
  const dir = w.dir ?? 1;
  // first half: outgoing shot leaves toward -dir, second half: next shot arrives from +dir
  const x = (p < 0 ? -dir : dir) * Math.pow(strength, 0.6) * 260;
  const blur = 70 * Math.pow(strength, 0.8);
  const id = `whip-${w.t}`;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#081436'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id} x="-20%" y="0%" width="140%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      <AbsoluteFill style={{transform: `translateX(${x}px) scale(${1 + 0.06 * strength})`, filter: `url(#${id}) brightness(${1 + 0.25 * strength})`}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
