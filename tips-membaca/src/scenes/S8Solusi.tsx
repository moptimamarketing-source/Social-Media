import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {At, Layer, Stage} from '../components/Camera';
import {Background, Particles} from '../components/Background';
import {Text3D, LOOK} from '../components/Text3D';
import {Block3D} from '../components/Book3D';
import {Character} from '../components/Character';
import {ProgressBar} from '../components/Meters';
import {Sparkle, Star} from '../components/Icons';
import {Float, Pop} from '../components/Motion';
import {EI, lerp, prog, sp, useT} from '../lib/time';
import {S8 as T} from '../data/timeline';

const SLAB_Y = 1195;
const GAP = 104;
const FIRST = 150;
const LEVELS = [
  {label: 'BAHASA MELAYU', color: C.white, w: 500, at: T.semua},
  {label: 'ENGLISH', color: C.blue, w: 450, at: T.pelajaran, text: C.white},
  {label: 'SAINS', color: C.navyMid, w: 400, at: T.pelajaran + 0.32, text: C.white},
  {label: 'MATHS', color: C.orange, w: 350, at: T.jadi, text: C.white},
];

/** Block that drops onto the stack with a squash and dust puff. */
const Drop: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => {
  const {t, f, fps} = useT();
  if (t < at) return null;
  const s = Math.min(1, sp(f, fps, at, {damping: 14, stiffness: 210, mass: 1}));
  const land = prog(t, at + 0.12, at + 0.45);
  const squash = t > at + 0.1 && t < at + 0.3 ? 1 - Math.sin(((t - at - 0.1) / 0.2) * Math.PI) * 0.07 : 1;
  return (
    <div style={{position: 'absolute', left: 540, top: lerp(-300, y, s), width: 0, height: 0}}>
      <div style={{transform: `scaleY(${squash})`, transformOrigin: '50% 100%', perspective: 1200}}>{children}</div>
      {land > 0 && land < 1 ? [-1, 1].map((d) => (
        <div key={d} style={{position: 'absolute', left: d * (180 + land * 120) - 40, top: 30, width: 80, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.6)',
          opacity: 1 - land, filter: 'blur(6px)'}} />
      )) : null}
    </div>
  );
};

/** SCENE 8 — "Kuatkan asas baca dulu, baru semua pelajaran jadi senang." */
export const S8Solusi: React.FC = () => {
  const {t, f, fps} = useT();
  const headOut = T.jadi - 0.05;
  const kid = sp(f, fps, T.jadi + 0.1, {damping: 10, stiffness: 150});
  const level = prog(t, T.baru, T.senang + 0.2, (x) => x);
  const stackTop = SLAB_Y - FIRST - (LEVELS.length - 1) * GAP - 60;
  return (
    <Stage keys={[{t: T.start, zoom: 1.0, y: 0}, {t: T.baru, zoom: 1.0}, {t: T.jadi, zoom: 1.02}, {t: T.end, zoom: 1.16, y: -170}]}
      shakes={[{t: T.kuatkan + 0.25, amp: 14}, ...LEVELS.map((l) => ({t: l.at + 0.25, amp: 5}))]}>
      <Layer depth={0.1}><Background variant="navy" rays raysColor="rgba(255,210,63,0.1)" /></Layer>
      <Layer depth={0.5}>
        {/* perspective floor grid */}
        <div style={{position: 'absolute', left: -600, right: -600, top: 1100, height: 900, transform: 'perspective(700px) rotateX(70deg)', transformOrigin: '50% 0',
          backgroundImage: 'linear-gradient(rgba(143,182,255,0.35) 3px, transparent 3px), linear-gradient(90deg, rgba(143,182,255,0.35) 3px, transparent 3px)',
          backgroundSize: '120px 120px', maskImage: 'linear-gradient(180deg, black, transparent 80%)', WebkitMaskImage: 'linear-gradient(180deg, black, transparent 80%)'}} />
        <Particles count={18} seed={41} rise={40} />
      </Layer>
      <Layer depth={0.9}>
        <Drop at={T.kuatkan} y={SLAB_Y}>
          <div style={{position: 'absolute', left: -300, top: -75}}><Block3D w={600} h={150} d={220} color={C.yellow} label="ASAS MEMBACA" fontSize={76} rotX={-16} rotY={0} /></div>
        </Drop>
        {LEVELS.map((l, i) => (
          <Drop key={l.label} at={l.at} y={SLAB_Y - FIRST - i * GAP}>
            <div style={{position: 'absolute', left: -l.w / 2, top: -40}}><Block3D w={l.w} h={80} d={170} color={l.color} label={l.label} labelColor={l.text ?? C.navy} fontSize={46} rotX={-12} rotY={0} /></div>
          </Drop>
        ))}
        <At x={150} y={1090}><Pop at={T.baru} from="up" dist={300}><Character who="mom" expr="happy" pose="thumbs" t={t} width={250} seed={1} look={[0.8, -0.2]} /></Pop></At>
        <At x={930} y={1090}><Pop at={T.baru + 0.2} from="up" dist={300}><Character who="dad" expr="happy" pose="wave" t={t} width={250} seed={2} look={[-0.8, -0.2]} /></Pop></At>
        {/* kid reads confidently on top of the solid stack */}
        {t > T.jadi ? (
          <div style={{position: 'absolute', left: 540, top: stackTop - 30, width: 0, height: 0, transform: `scale(${kid})`, transformOrigin: '0 0'}}>
            <div style={{position: 'absolute', left: -150, top: -380}}><Character who="kid" expr="happy" pose="book" t={t} width={300} look={[0, 0.5]} /></div>
            {[[-230, -330], [210, -360], [-190, -120], [230, -150]].map(([x, y], i) => (
              <div key={i} style={{position: 'absolute', left: x, top: y}}><Float phase={i} amp={12}>{i % 2 ? <Sparkle size={56} /> : <Star size={60} />}</Float></div>
            ))}
          </div>
        ) : null}
      </Layer>
      <Layer depth={1}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center', opacity: 1 - prog(t, headOut, headOut + 0.25, EI)}}>
          <Text3D text="KUATKAN ASAS" at={T.kuatkan + 0.1} size={116} anim="flip" {...LOOK.white} stagger={0.025} />
          <div style={{marginTop: -4}}><Text3D text="MEMBACA!" at={T.asas + 0.1} size={150} anim="elastic" {...LOOK.yellow} /></div>
        </div>
        <At x={540} y={640} style={{opacity: 1 - prog(t, headOut, headOut + 0.25, EI)}}>
          <Pop at={T.baru} from="flip"><ProgressBar level={level} label="PELAJARAN JADI SENANG" width={760} /></Pop>
        </At>
        <At x={540} y={stackTop - 470}>
          <Pop at={T.senang} from="scale"><div style={{fontFamily: F.display, fontSize: 84, color: C.navy, background: C.yellow, padding: '10px 36px 0', borderRadius: 30,
            transform: 'rotate(-4deg)', boxShadow: `0 10px 0 ${C.yellowDark}, 0 24px 30px rgba(0,0,0,0.4)`}}>SENANG! ✨</div></Pop>
        </At>
      </Layer>
      <AbsoluteFill style={{pointerEvents: 'none'}} />
    </Stage>
  );
};
