import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from './theme';
import {loadFonts} from './fonts';
import {cta, sfx, SRC, stages} from './data/timeline';
import {captions} from './data/captions';
import {FootageScene} from './scenes/FootageScene';
import {OverlayScene} from './scenes/OverlayScene';
import {Subtitle} from './components/Subtitle';
import {CTA} from './components/CTA';
import {ProgressTracker} from './components/Graphics';

loadFonts();

/** Soft navy vignettes so text and the platform UI stay readable. */
const Vignettes: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 260, background: `linear-gradient(${C.navyDeep}66, transparent)`}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 520, background: `linear-gradient(transparent, ${C.navyDeep}8c)`}} />
  </AbsoluteFill>
);

const SfxTrack: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <>
      {sfx.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * fps)} durationInFrames={Math.round(1.2 * fps)} layout="none">
          <Audio src={staticFile(`sfx/${s.name}.wav`)} volume={s.vol} />
        </Sequence>
      ))}
    </>
  );
};

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: C.navyDeep}}>
      <FootageScene />
      <Vignettes />
      <OverlayScene space="screen" />
      <div style={{position: 'absolute', left: 60, top: 226}}>
        <ProgressTracker steps={stages.steps} t={frame / fps} visible={stages.visible} />
      </div>
      <Subtitle captions={captions} />
      <CTA start={cta.start} headline={cta.headline} items={cta.items} />
      <Audio src={staticFile(SRC.dialogue)} />
      <SfxTrack />
    </AbsoluteFill>
  );
};
