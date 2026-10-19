import React from 'react';
import {Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {ramp, springAt, SPRING_POP} from '../lib/anim';
import {KineticText} from '../components/KineticText';
import {Scribble} from '../components/Scribble';
import {EmojiSticker} from '../components/Sticker';
import {hook} from '../data/timeline';

/**
 * 0–3.7s hook. Rendered in world space (inside the camera) so the panel and
 * tape sit exactly over the old title and punch in with the shot.
 * Order: panel → ANAK SUKA → tape → NEGO?! (bounce + shake) → scribble → 😩 → subline.
 */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const panel = springAt(frame, fps, 0, SPRING_POP);
  const tape = ramp(frame, 14, 22);
  const write = ramp(frame, 22, 40, (x) => x);
  const breathe = 1 + Math.sin(frame / 9) * 0.008;
  return (
    <>
      <div style={{position: 'absolute', left: 70, top: 232, width: 940, height: 300, transform: `rotate(-1.5deg) scale(${(0.7 + 0.3 * panel) * breathe})`,
        background: C.navy, borderRadius: 38, border: `6px solid ${C.yellow}`, boxShadow: '0 22px 50px rgba(0,0,0,.45)', opacity: Math.min(1, panel * 2)}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 14, textAlign: 'center'}}>
          <KineticText text={hook.line1} delay={3} anim="mask-up" size={76} color={C.white} style={{letterSpacing: 4}} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center'}}>
          <KineticText text={hook.keyword} delay={9} anim="elastic" size={136} color={C.yellow} shakeAmp={7} style={{textShadow: `0 8px 0 ${C.navyDeep}`}} />
        </div>
        <div style={{position: 'absolute', left: 255, top: 198}}>
          <Scribble frame={frame} from={18} to={28} width={430} color={C.orange} stroke={11} />
        </div>
        <div style={{position: 'absolute', left: 40, top: 226, width: 560, height: 66, transform: `translateX(${(1 - tape) * -700}px) rotate(-2deg)`,
          background: C.yellow, boxShadow: '0 8px 18px rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          clipPath: 'polygon(1.5% 0, 100% 5%, 98.5% 100%, 0 95%)'}}>
          <div style={{fontFamily: F.hand, fontSize: 60, color: C.navy, lineHeight: 1, paddingTop: 4, clipPath: `inset(-20% ${100 - write * 100}% -20% 0)`}}>{hook.subline}</div>
        </div>
      </div>
      <Sequence from={30} layout="none">
        <div style={{position: 'absolute', left: 905, top: 175}}>
          <EmojiSticker emoji={hook.emoji} size={120} rotate={14} />
        </div>
      </Sequence>
      <Sequence from={Math.round(hook.reaction.t * fps)} durationInFrames={Math.round((hook.reaction.end - hook.reaction.t) * fps)} layout="none">
        <div style={{position: 'absolute', left: hook.reaction.at[0] - 50, top: hook.reaction.at[1] - 50}}>
          <EmojiSticker emoji={hook.reaction.emoji} size={92} rotate={-8} />
        </div>
      </Sequence>
    </>
  );
};

