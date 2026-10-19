import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {At, Layer, Stage} from '../components/Camera';
import {Background, Particles} from '../components/Background';
import {Text3D, LOOK} from '../components/Text3D';
import {Character} from '../components/Character';
import {Bolt, Heart, StressCloud} from '../components/Icons';
import {Float} from '../components/Motion';
import {EI, prog, sp, useT} from '../lib/time';
import {S6 as T} from '../data/timeline';

/** Stress symbol that pops away (puff) at `goneAt`. */
const Stress: React.FC<{x: number; y: number; goneAt: number; children: React.ReactNode}> = ({x, y, goneAt, children}) => {
  const {t, f, fps} = useT();
  const inn = sp(f, fps, T.start + 0.2);
  const gone = prog(t, goneAt, goneAt + 0.18, EI);
  const puff = prog(t, goneAt, goneAt + 0.4);
  return (
    <At x={x} y={y}>
      <div style={{transform: `scale(${inn * (1 + gone * 0.4) * (1 - gone)}) rotate(${Math.sin(t * 14) * 6}deg)`, opacity: 1 - gone}}>{children}</div>
      {puff > 0 && puff < 1 ? [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return <div key={i} style={{position: 'absolute', left: Math.cos(a) * 90 * puff, top: Math.sin(a) * 90 * puff, width: 34, height: 34, borderRadius: '50%',
          background: '#FFFFFF', opacity: 1 - puff, transform: 'translate(-50%,-50%)'}} />;
      }) : null}
    </At>
  );
};

/** SCENE 6 — "Ibu ayah pun kurang stres." */
export const S6Lega: React.FC = () => {
  const {t} = useT();
  const relieved = t > T.kurang + 0.15;
  return (
    <Stage keys={[{t: T.start, zoom: 1.1, x: -30}, {t: T.kurang, zoom: 1.04, x: 0}, {t: T.end, zoom: 1.1, x: 20}]}>
      <Layer depth={0.1}><Background variant="warm" rays raysColor="rgba(255,255,255,0.16)" /></Layer>
      <Layer depth={0.35}>
        {/* cosy sofa back */}
        <div style={{position: 'absolute', left: -40, right: -40, top: 960, height: 520, borderRadius: '120px 120px 0 0', background: 'linear-gradient(180deg, #1E3C8F, #0E2363)',
          boxShadow: 'inset 0 20px 0 rgba(255,255,255,0.12)'}} />
        <Particles count={16} color="#FFFFFF" seed={31} rise={30} />
      </Layer>
      <Layer depth={0.85}>
        <At x={330} y={1000}>
          <Character who="mom" expr={relieved ? 'happy' : 'worried'} pose="rest" t={t} width={520} seed={1} look={[0.9, 0.4]} tilt={relieved ? -4 : 0} />
        </At>
        <At x={800} y={1080}>
          <Character who="kid" expr="happy" pose="book" t={t} width={400} look={[0, 0.6]} />
        </At>
        <Stress x={190} y={600} goneAt={T.kurang}><Bolt size={80} /></Stress>
        <Stress x={340} y={540} goneAt={T.kurang + 0.12}><StressCloud size={180} /></Stress>
        <Stress x={500} y={600} goneAt={T.stres}><div style={{fontFamily: F.display, fontSize: 110, color: C.red, textShadow: '0 6px 0 #7A1518'}}>!!</div></Stress>
        {relieved ? [0, 1, 2, 3, 4].map((i) => {
          const k = prog(t, T.kurang + 0.2 + i * 0.12, T.kurang + 1.6 + i * 0.12);
          return <At key={i} x={250 + i * 70 + Math.sin(t * 3 + i) * 20} y={760 - k * 420} style={{opacity: Math.sin(k * Math.PI)}}><Heart size={70 + (i % 2) * 20} /></At>;
        }) : null}
        <At x={600} y={680}>
          {relieved ? <Float amp={6}><div style={{fontFamily: F.hand, fontSize: 80, color: C.white, opacity: prog(t, T.kurang + 0.2, T.kurang + 0.5), textShadow: `0 4px 0 ${C.navy}`}}>fuhh~</div></Float> : null}
        </At>
      </Layer>
      <Layer depth={1}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 245, textAlign: 'center'}}>
          <Text3D text="PARENTS PUN" at={T.ibu} size={112} anim="flip" {...LOOK.white} stagger={0.025} />
          <div style={{marginTop: -4}}><Text3D text="LEGA!" at={T.kurang} size={170} anim="elastic" {...LOOK.navy} /></div>
        </div>
      </Layer>
      <AbsoluteFill style={{background: 'radial-gradient(90% 70% at 50% 40%, transparent 60%, rgba(120,50,0,0.25) 100%)', pointerEvents: 'none'}} />
    </Stage>
  );
};
