import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, dropShadow} from '../theme';
import {EASE_OUT, exitAt, springAt, SPRING_ELASTIC, SPRING_SOFT} from '../lib/anim';
import type {Crop, Layout} from '../data/timeline';
import {SRC} from '../data/timeline';

/**
 * Frames the source is ahead of the local timeline. Inside a <Sequence from={n}>
 * set this to n so the footage stays in sync with the dialogue.
 */
export const FootageOffset = React.createContext(0);

export const Footage: React.FC<{style?: React.CSSProperties}> = ({style}) => {
  const offset = React.useContext(FootageOffset);
  return (
    <OffthreadVideo
      src={staticFile(SRC.footage)}
      muted
      trimBefore={offset > 0 ? offset : undefined}
      style={{width: 1080, height: 1920, ...style}}
    />
  );
};

/** Shows a crop window of the source inside a w×h viewport — pseudo b-roll from the same take. */
export const CropView: React.FC<{crop: Crop; w: number; h: number}> = ({crop, w, h}) => {
  const z = crop.z;
  const hw = w / 2 / z;
  const hh = h / 2 / z;
  const cx = Math.min(Math.max(crop.at[0], hw), 1080 - hw);
  const cy = Math.min(Math.max(crop.at[1], hh), 1920 - hh);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: `translate(${w / 2 - cx * z}px, ${h / 2 - cy * z}px) scale(${z})`}}>
        <Footage />
      </div>
    </div>
  );
};

/** Close-up card over a blurred, darkened copy of the wide shot. */
const Inset: React.FC<{layout: Extract<Layout, {type: 'inset'}>}> = ({layout}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const enter = springAt(frame, fps, 0, SPRING_SOFT);
  const out = exitAt(frame, durationInFrames, 5);
  const {x, y, w, h, rotate} = layout.card;
  const scale = interpolate(enter, [0, 1], [0.82, 1]) * interpolate(out, [0, 1], [1, 0.9]);
  const rot = interpolate(enter, [0, 1], [-9, rotate]);
  const ty = interpolate(enter, [0, 1], [160, 0]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: 'scale(1.12)', filter: 'blur(26px) brightness(0.5) saturate(1.2)'}}>
        <Footage />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.navyDeep}99, ${C.navy}55 50%, ${C.navyDeep}aa)`}} />
      <div
        style={{
          position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 44, overflow: 'hidden',
          border: `10px solid ${C.white}`, boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
          transform: `translateY(${ty}px) rotate(${rot}deg) scale(${scale})`, opacity: 1 - out,
        }}
      >
        <CropView crop={layout.crop} w={w - 20} h={h - 20} />
      </div>
    </AbsoluteFill>
  );
};

/** Two stacked viewports cut from the same frame: reaction on top, detail below. */
const Split: React.FC<{layout: Extract<Layout, {type: 'split'}>}> = ({layout}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const a = springAt(frame, fps, 0, SPRING_SOFT);
  const b = springAt(frame, fps, 3, SPRING_SOFT);
  const out = exitAt(frame, durationInFrames, 4);
  const line = interpolate(frame, [4, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});
  return (
    <AbsoluteFill style={{background: C.navyDeep}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 960, overflow: 'hidden', transform: `translateX(${(1 - a) * -1080 + out * -60}px)`}}>
        <CropView crop={layout.top} w={1080} h={960} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 960, width: 1080, height: 960, overflow: 'hidden', transform: `translateX(${(1 - b) * 1080 + out * 60}px)`}}>
        <CropView crop={layout.bottom} w={1080} h={960} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 953, height: 14, width: 1080 * line, background: C.yellow, boxShadow: dropShadow}} />
    </AbsoluteFill>
  );
};

export const BrollOverlay: React.FC<{layout: Layout}> = ({layout}) =>
  layout.type === 'inset' ? <Inset layout={layout} /> : <Split layout={layout} />;

/** Masked circle close-up (reaction cam) sitting over the main shot. */
export const PipCircle: React.FC<{size: number; crop: Crop}> = ({size, crop}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const s = springAt(frame, fps, 0, SPRING_ELASTIC);
  const out = exitAt(frame, durationInFrames, 5);
  return (
    <div style={{width: size, height: size, transform: `scale(${s * (1 - out)}) rotate(${(1 - s) * -20}deg)`}}>
      <div style={{position: 'absolute', inset: -14, borderRadius: '50%', background: C.yellow, boxShadow: '0 18px 40px rgba(0,0,0,0.4)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `8px solid ${C.navy}`}}>
        <CropView crop={crop} w={size - 16} h={size - 16} />
      </div>
    </div>
  );
};
