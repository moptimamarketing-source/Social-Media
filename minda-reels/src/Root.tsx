import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {VIDEO} from './data/timeline';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="AnakSukaNego"
    component={Video}
    durationInFrames={Math.round(VIDEO.duration * VIDEO.fps)}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
  />
);
