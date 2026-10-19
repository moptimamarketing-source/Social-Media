import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {C} from './theme';
import {loadFonts} from './fonts';
import {SceneWrap} from './components/SceneWrap';
import {Subtitle} from './components/Subtitle';
import {S1, S2, S3, S4, S5, S6, S7, S8, S9, sfx} from './data/timeline';
import {S1Hook} from './scenes/S1Hook';
import {S2Masalah} from './scenes/S2Masalah';
import {S3Homework} from './scenes/S3Homework';
import {S4Kunci} from './scenes/S4Kunci';
import {S5Yakin} from './scenes/S5Yakin';
import {S6Lega} from './scenes/S6Lega';
import {S7Pesanan} from './scenes/S7Pesanan';
import {S8Solusi} from './scenes/S8Solusi';
import {S9CTA} from './scenes/S9CTA';

loadFonts();

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

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: C.navyDeep}}>
    <SceneWrap start={S1.start} end={S1.end} enter="fade" inDur={0.01} exit="zoom-through" outDur={0.3} origin="50% 46%"><S1Hook /></SceneWrap>
    <SceneWrap start={S2.start} end={S2.end} enter="zoom" inDur={0.3}><S2Masalah /></SceneWrap>
    <SceneWrap start={S3.start} end={S3.end} enter="slide-left" inDur={0.3}><S3Homework /></SceneWrap>
    <SceneWrap start={S4.start} end={S4.end} enter="flash" inDur={0.45}><S4Kunci /></SceneWrap>
    <SceneWrap start={S5.start} end={S5.end} enter="iris" inDur={0.4}><S5Yakin /></SceneWrap>
    <SceneWrap start={S6.start} end={S6.end} enter="wipe" inDur={0.35}><S6Lega /></SceneWrap>
    <SceneWrap start={S7.start} end={S7.end} enter="slide-up" inDur={0.35}><S7Pesanan /></SceneWrap>
    <SceneWrap start={S8.start} end={S8.end} enter="drop" inDur={0.35}><S8Solusi /></SceneWrap>
    <SceneWrap start={S9.start} end={S9.end} enter="zoom" inDur={0.4}><S9CTA /></SceneWrap>
    {/* subtitle band backdrop keeps captions readable on every scene */}
    <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 68%, rgba(3,8,26,0.45) 80%, rgba(3,8,26,0.7) 100%)', pointerEvents: 'none'}} />
    <Subtitle />
    <Audio src={staticFile('voice.mp3')} />
    <SfxTrack />
  </AbsoluteFill>
);
