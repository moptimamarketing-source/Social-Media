import React from 'react';
import {Freeze, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {camera, hook, layouts, segments, whips} from '../data/timeline';
import {PunchZoom, Whip} from '../components/PunchZoom';
import {BrollOverlay, Footage, FootageOffset} from '../components/BrollOverlay';
import {HookScene} from './HookScene';
import {OverlayScene} from './OverlayScene';

/**
 * The picture: source footage through the virtual camera (with freezes for the
 * custom transitions), world-space graphics riding on it, pseudo b-roll
 * layouts replacing it where scheduled, and whip-pans on top.
 */
export const FootageScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const inLayout = layouts.some((l) => t >= l.start && t < l.end);
  const seg = segments.find((s) => t >= s.start && t < s.end) ?? segments[segments.length - 1];
  const video = <Footage style={{filter: 'contrast(1.05) saturate(1.08)'}} />;
  return (
    <Whip whips={whips}>
      {!inLayout ? (
        <PunchZoom keys={camera}>
          {seg.type === 'freeze' ? <Freeze frame={Math.round(seg.at * fps)}>{video}</Freeze> : video}
          <Sequence durationInFrames={Math.round(hook.end * fps)} layout="none">
            <HookScene />
          </Sequence>
          <OverlayScene space="world" />
        </PunchZoom>
      ) : null}
      {layouts.map((l, i) => {
        const from = Math.round(l.start * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.round((l.end - l.start) * fps)}>
            <FootageOffset.Provider value={from}>
              <BrollOverlay layout={l} />
            </FootageOffset.Provider>
          </Sequence>
        );
      })}
    </Whip>
  );
};
