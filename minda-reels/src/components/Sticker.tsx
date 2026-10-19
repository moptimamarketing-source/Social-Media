import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, dropShadow, F, outline} from '../theme';
import {exitAt, ramp, shake, springAt, SPRING_ELASTIC, SPRING_POP} from '../lib/anim';
import {Arrow} from './Scribble';

type Variant = 'sticker' | 'comic' | 'burst';

/** Reaction text: die-cut sticker, comic slam, or starburst. Scale 0 → 115% → 100%. */
export const Sticker: React.FC<{text: string; variant: Variant; rotate?: number; animation?: 'pop' | 'slam'}> = ({
  text, variant, rotate = 0, animation = 'pop',
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const out = exitAt(frame, durationInFrames, 4);
  let scale: number;
  if (animation === 'slam') {
    // starts big and slams down onto the frame
    const s = springAt(frame, fps, 0, {damping: 9, stiffness: 260, mass: 0.6});
    scale = interpolate(s, [0, 1], [2.2, 1]);
  } else {
    scale = springAt(frame, fps, 0, SPRING_ELASTIC);
  }
  const opacity = Math.min(1, frame / 2) * (1 - out);
  const rot = rotate + shake(frame, 2, animation === 'slam' ? 7 : 4, 12);
  const idle = Math.sin(frame / 7) * 1.2;
  const transform = `rotate(${rot + idle}deg) scale(${scale * (1 - out * 0.4)})`;

  if (variant === 'burst') {
    const pts = Array.from({length: 24}, (_, i) => {
      const r = i % 2 === 0 ? 1 : 0.78;
      const a = (i / 24) * Math.PI * 2;
      return `${50 + 50 * r * Math.cos(a)},${50 + 50 * r * Math.sin(a)}`;
    }).join(' ');
    return (
      <div style={{position: 'relative', width: 340, height: 240, transform, opacity}}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,.35))'}}>
          <polygon points={pts} fill={C.yellow} stroke={C.navy} strokeWidth={3} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontSize: 92, color: C.navy, letterSpacing: 1}}>
          {text}
        </div>
      </div>
    );
  }

  if (variant === 'comic') {
    return (
      <div style={{fontFamily: F.display, fontSize: 110, lineHeight: 1, color: C.yellow, whiteSpace: 'nowrap', transform, opacity,
        ...outline(16), textShadow: `0 10px 0 ${C.navyDeep}`}}>
        {text}
      </div>
    );
  }

  return (
    <div style={{fontFamily: F.display, fontSize: 70, lineHeight: 1.05, color: C.navy, background: C.white, padding: '18px 34px 10px', borderRadius: 30,
      border: `6px solid ${C.navy}`, boxShadow: `0 0 0 10px ${C.white}, ${dropShadow}`, whiteSpace: 'nowrap', transform, opacity}}>
      {text}
    </div>
  );
};

/** Handwritten note: write-on reveal in marker ink, or a yellow sticky note. Optional arrow. */
export const Handwritten: React.FC<{text: string; variant?: 'note' | 'ink'; rotate?: number; arrow?: [number, number]}> = ({
  text, variant = 'ink', rotate = 0, arrow,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const out = exitAt(frame, durationInFrames, 5);
  const write = ramp(frame, 0, Math.min(14, durationInFrames - 6));
  if (variant === 'note') {
    const s = springAt(frame, fps, 0, SPRING_POP);
    return (
      <div style={{transform: `rotate(${rotate + (1 - s) * 18}deg) scale(${s * (1 - out * 0.3)}) translateY(${(1 - s) * 40}px)`, opacity: 1 - out,
        background: C.yellow, padding: '18px 36px 14px', borderRadius: 10, boxShadow: '0 16px 30px rgba(0,0,0,0.35)', position: 'relative'}}>
        <div style={{position: 'absolute', top: -18, left: '50%', width: 120, height: 34, marginLeft: -60, background: 'rgba(255,255,255,0.55)', transform: 'rotate(-4deg)'}} />
        <div style={{fontFamily: F.hand, fontSize: 92, lineHeight: 1, color: C.navy, whiteSpace: 'nowrap',
          clipPath: `inset(0 ${100 - write * 100}% 0 0)`}}>{text}</div>
      </div>
    );
  }
  return (
    <div style={{position: 'relative', transform: `rotate(${rotate}deg)`, opacity: 1 - out}}>
      <div style={{fontFamily: F.hand, fontSize: 84, lineHeight: 1, color: C.white, whiteSpace: 'nowrap', ...outline(12), textShadow: '0 6px 14px rgba(0,0,0,.45)',
        clipPath: `inset(-30% ${100 - write * 100}% -30% -10%)`}}>{text}</div>
      {arrow ? (
        <div style={{position: 'absolute', left: '50%', top: '100%'}}>
          <Arrow frame={frame} from={10} dx={arrow[0]} dy={arrow[1]} color={C.yellow} />
        </div>
      ) : null}
    </div>
  );
};

/** Single emoji sticker with a white die-cut halo. */
export const EmojiSticker: React.FC<{emoji: string; size: number; rotate?: number; badge?: number}> = ({emoji, size, rotate = 0, badge}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const s = springAt(frame, fps, 0, SPRING_ELASTIC);
  const out = exitAt(frame, durationInFrames, 4);
  if (badge) {
    // solid round badge (also hides whatever is underneath)
    return (
      <div style={{width: badge, height: badge, borderRadius: '50%', background: C.white, border: `8px solid ${C.navy}`, boxShadow: dropShadow,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${rotate + Math.sin(frame / 5) * 4}deg) scale(${s * (1 - out)})`}}>
        <span style={{fontFamily: F.emoji, fontSize: size, lineHeight: 1}}>{emoji}</span>
      </div>
    );
  }
  return (
    <div style={{fontFamily: F.emoji, fontSize: size, lineHeight: 1, transform: `rotate(${rotate + Math.sin(frame / 5) * 4}deg) scale(${s * (1 - out)})`,
      filter: 'drop-shadow(0 0 0 white) drop-shadow(4px 0 0 white) drop-shadow(-4px 0 0 white) drop-shadow(0 4px 0 white) drop-shadow(0 -4px 0 white) drop-shadow(0 12px 16px rgba(0,0,0,.35))'}}>
      {emoji}
    </div>
  );
};
