import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {EASE_OUT, exitAt, ramp, springAt, SPRING_ELASTIC, SPRING_SOFT} from '../lib/anim';
import {Meter} from './Meter';

/** Host-section mini text card: numbered badge + point. Wipes in, slides up out. */
export const KeywordCard: React.FC<{badge: string; text: string; emoji: string; meter?: {label: string; fillFrom: number; plusAt: number}}> = ({
  badge, text, emoji, meter,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const enter = springAt(frame, fps, 0, SPRING_SOFT);
  const wipe = ramp(frame, 0, 9, EASE_OUT);
  const badgeS = springAt(frame, fps, 4, SPRING_ELASTIC);
  const emojiS = springAt(frame, fps, 9, SPRING_ELASTIC);
  const textP = ramp(frame, 3, 12);
  const out = exitAt(frame, durationInFrames, 6);
  return (
    <div style={{transform: `translateY(${(1 - enter) * 40 - out * 60}px) rotate(-1.5deg)`, opacity: 1 - out, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{position: 'relative', background: C.navy, borderRadius: 30, padding: meter ? '22px 40px 26px' : '22px 40px 18px', border: `5px solid ${C.yellow}`,
        boxShadow: '0 18px 40px rgba(0,0,0,.45)', clipPath: `inset(-40px ${100 - wipe * 100}% -40px -40px round 30px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{width: 74, height: 74, borderRadius: 22, background: C.yellow, color: C.navy, fontFamily: F.sans, fontWeight: 900, fontSize: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${badgeS}) rotate(${(1 - badgeS) * -30}deg)`}}>{badge}</div>
          <div style={{fontFamily: F.display, fontSize: 70, lineHeight: 1, color: C.white, whiteSpace: 'nowrap', paddingTop: 8,
            transform: `translateX(${(1 - textP) * 30}px)`, opacity: textP}}>{text}</div>
          <div style={{fontFamily: F.emoji, fontSize: 64, transform: `scale(${emojiS}) rotate(${Math.sin(frame / 6) * 6}deg)`}}>{emoji}</div>
        </div>
        {meter ? (
          <div style={{marginTop: 16, display: 'flex', justifyContent: 'center', opacity: interpolate(frame, [meter.fillFrom - 6, meter.fillFrom], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
            <Meter label={meter.label} fillFrom={meter.fillFrom} plusAt={meter.plusAt} />
          </div>
        ) : null}
      </div>
    </div>
  );
};
