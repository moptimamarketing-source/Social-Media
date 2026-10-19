import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {At, Layer, Stage} from '../components/Camera';
import {Background, Particles} from '../components/Background';
import {Text3D, LOOK} from '../components/Text3D';
import {Character} from '../components/Character';
import {ConfidenceMeter} from '../components/Meters';
import {CheckBadge, Sparkle, Star} from '../components/Icons';
import {Float, Pop} from '../components/Motion';
import {EIO, lerp, prog, sp, useT} from '../lib/time';
import {S5 as T} from '../data/timeline';

/** SCENE 5 — "Bila anak dah boleh baca, dia jadi lebih yakin, tak takut salah, dan boleh belajar lebih berdikari." */
export const S5Yakin: React.FC = () => {
  const {t, f, fps} = useT();
  const glow = prog(t, T.boleh - 0.1, T.boleh + 0.5, EIO); // confused → happy
  const sweep = prog(t, T.boleh - 0.15, T.boleh + 0.35);
  const level = t < T.lebih ? 0.15 : t < T.salah ? lerp(0.15, 0.5, prog(t, T.yakin - 0.2, T.yakin + 0.4)) : t < T.berdikari
    ? lerp(0.5, 0.78, prog(t, T.salah, T.salah + 0.5)) : lerp(0.78, 1, prog(t, T.berdikari, T.berdikari + 0.6));
  const meterIn = sp(f, fps, T.lebih - 0.2);
  const cheer = t > T.lebih2;
  const okMorph = t > T.salah;
  return (
    <Stage keys={[{t: T.start, zoom: 1.12, y: 30}, {t: T.boleh, zoom: 1.0, y: 0}, {t: T.yakin, zoom: 1.04}, {t: T.tak, zoom: 1.02, x: 20}, {t: T.berdikari, zoom: 1.08, x: 0, y: -20}, {t: T.end, zoom: 1.12}]}>
      <Layer depth={0.1}>
        <AbsoluteFill style={{opacity: 1 - glow}}><Background variant="dim" /></AbsoluteFill>
        <AbsoluteFill style={{opacity: glow}}><Background variant="bright" rays raysColor="rgba(255,255,255,0.12)" /></AbsoluteFill>
      </Layer>
      <Layer depth={0.4} style={{opacity: glow}}>
        <Particles count={30} seed={21} rise={50} />
        {[[160, 640, 0], [920, 610, 1], [940, 1140, 2], [130, 1240, 3]].map(([x, y, ph], i) => (
          <At key={i} x={x} y={y}><Pop at={T.boleh + 0.1 + i * 0.1}><Float phase={ph} amp={18} rot={12}>{i % 2 ? <Sparkle size={70} /> : <Star size={80} />}</Float></Pop></At>
        ))}
      </Layer>
      <Layer depth={0.9}>
        <At x={570} y={990}>
          <div style={{filter: `grayscale(${1 - glow}) brightness(${lerp(0.75, 1, glow)})`}}>
            <Character who="kid" expr={glow < 0.5 ? 'confused' : cheer ? 'excited' : 'happy'} pose={glow < 0.5 ? 'chin' : cheer ? 'cheer' : 'book'} t={t} width={580}
              look={glow < 0.5 ? [0.6, 0.4] : cheer ? [0, -0.3] : [0, 0.5]} />
          </div>
        </At>
        {/* magic sweep */}
        {sweep > 0 && sweep < 1 ? (
          <AbsoluteFill style={{background: `linear-gradient(115deg, transparent ${sweep * 140 - 30}%, rgba(255,240,180,0.85) ${sweep * 140 - 15}%, transparent ${sweep * 140}%)`}} />
        ) : null}
        <At x={130} y={960} style={{transform: `translate(-50%,-50%) translateX(${(1 - meterIn) * -260}px)`}}><ConfidenceMeter level={level} /></At>
        <At x={880} y={760}>
          <Pop at={T.tak} from="scale">
            <div style={{transform: `rotateY(${okMorph ? lerp(180, 360, prog(t, T.salah, T.salah + 0.3)) : 0}deg)`}}><CheckBadge ok={okMorph && prog(t, T.salah, T.salah + 0.3) > 0.5} size={150} /></div>
          </Pop>
        </At>
        {cheer ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i / 8) * Math.PI * 2;
          const k = prog(t, T.berdikari, T.berdikari + 0.8);
          return <At key={i} x={570 + Math.cos(a) * 400 * k} y={640 + Math.sin(a) * 260 * k} style={{opacity: 1 - prog(t, T.berdikari + 0.6, T.berdikari + 1.1)}}><Star size={64} /></At>;
        }) : null}
      </Layer>
      <Layer depth={1}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center'}}>
          {t < T.tak + 0.3 ? <Text3D text="LEBIH YAKIN!" at={T.lebih} size={140} anim="elastic" {...LOOK.yellow} exitAt={T.tak - 0.05} /> : null}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center'}}>
          {t >= T.tak - 0.05 && t < T.dan + 0.5 ? <Text3D text="TAK TAKUT SALAH!" at={T.tak} size={112} anim="flip" {...LOOK.yellow} stagger={0.02} exitAt={T.dan + 0.15} /> : null}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center'}}>
          {t >= T.dan + 0.3 ? <Text3D text="LEBIH BERDIKARI!" at={T.dan + 0.35} size={112} anim="drop" {...LOOK.yellow} stagger={0.03} /> : null}
        </div>
      </Layer>
    </Stage>
  );
};
