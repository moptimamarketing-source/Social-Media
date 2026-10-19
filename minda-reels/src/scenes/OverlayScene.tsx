import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {overlays, Overlay} from '../data/timeline';
import {resolvePos} from '../lib/safeArea';
import {Handwritten, EmojiSticker, Sticker} from '../components/Sticker';
import {SpeechBubble} from '../components/SpeechBubble';
import {CalloutRing, Metaphor, Timer} from '../components/Graphics';
import {KeywordCard} from '../components/KeywordCard';
import {FootageOffset, PipCircle} from '../components/BrollOverlay';

const Centered: React.FC<{at: [number, number]; children: React.ReactNode}> = ({at, children}) => (
  <div style={{position: 'absolute', left: at[0], top: at[1], transform: 'translate(-50%, -50%)'}}>{children}</div>
);

const renderItem = (o: Overlay, fps: number) => {
  const at = resolvePos(o.position, o.start);
  const f0 = Math.round(o.start * fps);
  switch (o.type) {
    case 'reaction-text':
      return <Centered at={at}><Sticker text={o.text} variant={o.variant} rotate={o.rotate} animation={o.animation} /></Centered>;
    case 'speech-bubble':
      return <SpeechBubble text={o.text} at={at} tail={o.tail} width={o.width} size={o.size} />;
    case 'handwritten':
      return (
        <Centered at={at}>
          <Handwritten text={o.text} variant={o.variant} rotate={o.rotate} arrow={o.arrowTo ? [o.arrowTo[0] - at[0], o.arrowTo[1] - at[1] - 60] : undefined} />
        </Centered>
      );
    case 'emoji':
      return <Centered at={at}><EmojiSticker emoji={o.text} size={o.size} rotate={o.rotate} badge={o.badge} /></Centered>;
    case 'metaphor':
      return <Centered at={at}><Metaphor left={o.left} right={o.right} /></Centered>;
    case 'timer':
      return <Centered at={at}><Timer label={o.label} /></Centered>;
    case 'callout-ring':
      return <Centered at={at}><CalloutRing radius={o.radius} /></Centered>;
    case 'pip':
      return (
        <Centered at={at}>
          <FootageOffset.Provider value={f0}>
            <PipCircle size={o.size} crop={o.crop} />
          </FootageOffset.Provider>
        </Centered>
      );
    case 'keyword-card': {
      const meter = o.meter
        ? {label: o.meter.label, fillFrom: Math.round((o.meter.fillFrom - o.start) * fps), plusAt: Math.round((o.meter.plusAt - o.start) * fps)}
        : undefined;
      return <Centered at={at}><KeywordCard badge={o.badge} text={o.text} emoji={o.emoji} meter={meter} /></Centered>;
    }
  }
};

/** Renders every timeline graphic for one space (screen = on top of the frame, world = inside the camera). */
export const OverlayScene: React.FC<{space: 'screen' | 'world'}> = ({space}) => {
  const {fps} = useVideoConfig();
  const items = overlays.filter((o) => (o.space ?? 'screen') === space);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {items.map((o, i) => (
        <Sequence key={i} from={Math.round(o.start * fps)} durationInFrames={Math.max(1, Math.round((o.end - o.start) * fps))} layout="none">
          {renderItem(o, fps)}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
