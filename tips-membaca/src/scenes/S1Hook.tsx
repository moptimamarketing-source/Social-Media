import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {At, Layer, Stage} from '../components/Camera';
import {Background, Particles} from '../components/Background';
import {Text3D, LOOK} from '../components/Text3D';
import {Book3D} from '../components/Book3D';
import {Pencil, QMark, Sparkle, Star} from '../components/Icons';
import {Float, Pop} from '../components/Motion';
import {Character} from '../components/Character';
import {EIO, ELASTIC, lerp, prog, sp, useT} from '../lib/time';
import {S1 as T} from '../data/timeline';

/** HOOK — "Nah! Ini tips yang berguna untuk ibu ayah di luar sana! Ibu ayah nak tahu tak?" */
export const S1Hook: React.FC = () => {
  const {t, f, fps} = useT();
  const up = prog(t, T.question, T.question + 0.5, EIO); // headline moves up when the question lands
  const q = sp(f, fps, T.question, ELASTIC);
  const qPulse = 1 + 0.12 * Math.max(0, Math.sin((t - T.tahu) * 9)) * (t > T.tahu && t < T.tahu + 0.35 ? 1 : 0)
    + 0.16 * Math.max(0, Math.sin((t - T.tak) * 9)) * (t > T.tak && t < T.tak + 0.35 ? 1 : 0);
  const burst = sp(f, fps, 0, {damping: 12, stiffness: 260});
  const nahOut = prog(t, T.tips - 0.12, T.tips + 0.1);
  return (
    <Stage keys={[{t: 0, zoom: 1.2}, {t: 0.45, zoom: 1}, {t: T.tips, zoom: 1}, {t: T.tips + 0.25, zoom: 1.06}, {t: T.ibu, zoom: 1.0}, {t: T.question, zoom: 1.0, y: 0},
      {t: T.question + 0.5, zoom: 1.1, y: 30}, {t: T.tak, zoom: 1.16, y: 40}, {t: T.end, zoom: 1.2, y: 40}]}
      shakes={[{t: 0.02, amp: 14}, {t: T.tips + 0.05, amp: 8}, {t: T.question + 0.05, amp: 6}]}>
      <Layer depth={0.1}><Background variant="navy" rays /></Layer>
      <Layer depth={0.4}>
        <Particles count={24} seed={3} />
        {[[120, 330, 0], [930, 520, 1.2], [160, 1180, 2.1], [940, 1240, 3]].map(([x, y, ph], i) => (
          <At key={i} x={x} y={y}><Pop at={0.2 + i * 0.12} from="scale"><Float phase={ph} amp={20}><QMark size={110 - i * 10} color={i % 2 ? C.white : C.yellow} /></Float></Pop></At>
        ))}
        <At x={860} y={300}><Pop at={1.4}><Float phase={1}><Sparkle size={70} /></Float></Pop></At>
        <At x={220} y={760}><Pop at={1.6}><Float phase={2}><Star size={90} /></Float></Pop></At>
      </Layer>
      <Layer depth={0.75}>
        <At x={200} y={1000}><Pop at={T.tips + 0.2} from="left"><Float speed={0.35} rot={6}><div style={{perspective: 1200}}>
          <Book3D w={210} h={280} d={56} color={C.yellow} title="ABC" titleColor={C.navy} rotY={-30 + Math.sin(t) * 18} rotX={-14} />
        </div></Float></Pop></At>
        <At x={880} y={1010}><Pop at={T.tips + 0.35} from="right"><Float speed={0.4} rot={10} phase={2}><Pencil size={260} style={{transform: 'rotate(-35deg)'}} /></Float></Pop></At>
      </Layer>
      <Layer depth={1}>
        {/* NAH! burst */}
        {t < T.tips + 0.15 ? (
          <div style={{position: 'absolute', left: 540, top: 900, width: 0, height: 0, transform: `scale(${burst * (1 - nahOut)})`}}>
            <svg width={760} height={760} viewBox="0 0 100 100" style={{position: 'absolute', left: -380, top: -380, transform: `rotate(${t * 40}deg)`}}>
              <polygon points={Array.from({length: 28}, (_, i) => { const r = i % 2 ? 34 : 50; const a = (i / 28) * Math.PI * 2; return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`; }).join(' ')}
                fill={C.yellow} stroke={C.yellowDeep} strokeWidth={1.5} />
            </svg>
            <div style={{position: 'absolute', left: -500, width: 1000, top: -130, textAlign: 'center'}}><Text3D text="NAH!" at={0} size={230} anim="slam" {...LOOK.navy} /></div>
          </div>
        ) : null}
        {/* headline */}
        <div style={{position: 'absolute', left: 0, right: 0, top: lerp(560, 250, up), transform: `scale(${lerp(1, 0.72, up)})`, transformOrigin: '50% 0', textAlign: 'center'}}>
          <Text3D text="TIPS" at={T.tips} size={270} anim="elastic" {...LOOK.yellow} stagger={0.06} />
          <div style={{marginTop: -6}}><Text3D text="UNTUK IBU AYAH!" at={T.untuk} size={108} anim="flip" {...LOOK.white} stagger={0.03} /></div>
        </div>
        {/* parents pop up from the bottom ledge */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1330, overflow: 'hidden'}}>
          <At x={270} y={1150}><Pop at={T.ibu} from="up" dist={500} config={{damping: 10, stiffness: 160}}>
            <Character who="mom" expr={t > T.question ? 'smile' : 'happy'} pose={t < T.question ? 'wave' : 'rest'} t={t} width={340} seed={1} look={t > T.question ? [0.9, -0.3] : [0, 0]} />
          </Pop></At>
          <At x={810} y={1150}><Pop at={T.ayah} from="up" dist={500} config={{damping: 10, stiffness: 160}}>
            <Character who="dad" expr={t > T.question ? 'neutral' : 'smile'} pose={t < T.question ? 'thumbs' : 'rest'} t={t} width={340} seed={2} look={t > T.question ? [-0.9, -0.3] : [0, 0]} />
          </Pop></At>
        </div>
        {/* the big question */}
        {t >= T.question ? (
          <At x={540} y={880} style={{transform: `translate(-50%,-50%) scale(${q * qPulse}) rotate(${Math.sin(t * 5) * 8}deg)`}}>
            <div style={{position: 'absolute', left: -230, top: -230, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,210,63,0.45), transparent 65%)'}} />
            <QMark size={520} />
          </At>
        ) : null}
        {t >= T.question ? [0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2 + 0.4;
          const k = prog(t, T.question + 0.05, T.question + 0.7);
          return <At key={i} x={540 + Math.cos(a) * 330 * k} y={880 + Math.sin(a) * 300 * k} style={{opacity: 1 - prog(t, T.question + 0.9, T.question + 1.3)}}>
            <QMark size={90} color={i % 2 ? C.white : C.yellow} /></At>;
        }) : null}
      </Layer>
      <AbsoluteFill style={{pointerEvents: 'none'}} />
    </Stage>
  );
};
