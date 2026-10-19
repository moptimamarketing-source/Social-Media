import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {At, Layer, Stage} from '../components/Camera';
import {Background, Particles} from '../components/Background';
import {Text3D, LOOK} from '../components/Text3D';
import {Character} from '../components/Character';
import {Clock3D, QMark, Snail} from '../components/Icons';
import {Desk, StudyRoom} from '../components/Room';
import {EIO, lerp, POP, prog, sp, useT} from '../lib/time';
import {S3 as T} from '../data/timeline';

const PANEL_H = 330;
const panelTop = (i: number) => 250 + i * (PANEL_H + 22);

/** One of the three split-screen situations: a 3D card sliding in from alternating sides. */
const Panel: React.FC<{i: number; at: number; children: React.ReactNode; tint: string}> = ({i, at, children, tint}) => {
  const {t, f, fps} = useT();
  if (t < at) return null;
  const s = sp(f, fps, at, POP);
  const away = prog(t, T.expand - 0.05, T.expand + 0.35, EIO);
  const dir = i % 2 ? 1 : -1;
  return (
    <div style={{position: 'absolute', left: 40, top: panelTop(i), width: 1000, height: PANEL_H, perspective: 1400}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 40, overflow: 'hidden', background: `linear-gradient(135deg, ${tint}, #0E2260)`,
        border: '6px solid rgba(255,255,255,0.85)', boxShadow: '0 30px 50px rgba(0,0,0,0.45)',
        transform: `translateX(${(1 - s) * dir * 1100 + away * dir * -1100}px) rotateY(${(1 - s) * dir * -35}deg)`, filter: `blur(${away * 10}px)`}}>
        {children}
      </div>
    </div>
  );
};

/** SCENE 3 — "Homework lambat, soalan tak faham, dan anak mula rasa... Saya tak pandai." */
export const S3Homework: React.FC = () => {
  const {t, f, fps} = useT();
  const grow = prog(t, T.homework, T.lambat + 0.6);
  const sad = prog(t, T.expand, T.expand + 0.6, EIO);
  const think = sp(f, fps, T.saya - 0.35, {damping: 16, stiffness: 90});
  return (
    <Stage keys={[{t: T.start, zoom: 1}, {t: T.expand, zoom: 1}, {t: T.end, zoom: 1.12, y: -30}]}>
      <Background variant="dim" />
      <Layer depth={1}>
        <Panel i={0} at={T.homework} tint="#2F62D8">
          {/* homework tower growing + clock + snail */}
          <div style={{position: 'absolute', left: 60, bottom: 30}}>
            {Array.from({length: 7}, (_, k) => (
              <div key={k} style={{position: 'absolute', left: Math.sin(k * 1.7) * 12, bottom: k * 30, width: 170, height: 26, borderRadius: 6,
                background: k % 2 ? '#FFFDF6' : '#E9E3D2', boxShadow: '0 4px 0 rgba(0,0,0,0.2)', opacity: grow * 7 > k ? 1 : 0,
                transform: `rotate(${Math.sin(k * 2.3 + t * 2) * 3}deg)`}} />
            ))}
          </div>
          <div style={{position: 'absolute', left: 250, top: 26}}><Clock3D size={150} t={t} speed={12} /></div>
          <div style={{position: 'absolute', left: lerp(240, 330, prog(t, T.homework, T.end)), bottom: 22}}><Snail size={130} /></div>
          <div style={{position: 'absolute', left: 430, top: 54, textAlign: 'left'}}>
            <Text3D text="HOMEWORK" at={T.homework + 0.1} size={96} anim="flip" {...LOOK.white} tiltX={8} float={false} />
            <div><Text3D text="LAMBAT" at={T.lambat} size={112} anim="elastic" {...LOOK.yellow} tiltX={8} float={false} /></div>
          </div>
        </Panel>
        <Panel i={1} at={T.soalan} tint="#14327A">
          <div style={{position: 'absolute', left: 0, top: 20}}>
            <Character who="kid" expr="confused" pose="chin" t={t} width={300} look={[0.8, 0.2]} />
          </div>
          <div style={{position: 'absolute', left: 250, top: 70, width: 150, height: 190, background: '#FFFDF6', borderRadius: 12, transform: 'rotate(8deg)',
            boxShadow: '0 12px 20px rgba(0,0,0,0.35)', padding: 14, boxSizing: 'border-box'}}>
            <div style={{fontFamily: F.display, fontSize: 24, color: C.navy}}>SOALAN 1</div>
            {[0, 1, 2].map((k) => <div key={k} style={{height: 8, margin: '12px 0', borderRadius: 4, background: '#C9D3EA', width: `${85 - k * 15}%`}} />)}
            <div style={{position: 'absolute', right: -30, top: -50, transform: `scale(${0.8 + Math.abs(Math.sin(t * 4)) * 0.2})`}}><QMark size={110} /></div>
          </div>
          <div style={{position: 'absolute', left: 450, top: 60, textAlign: 'left'}}>
            <Text3D text="SOALAN" at={T.soalan + 0.1} size={100} anim="flip" {...LOOK.white} tiltX={8} float={false} />
            <div><Text3D text="TAK FAHAM" at={T.faham - 0.1} size={100} anim="elastic" {...LOOK.yellow} tiltX={8} float={false} /></div>
          </div>
        </Panel>
        <Panel i={2} at={T.dan} tint="#2A3767">
          <div style={{position: 'absolute', left: 30, top: 30}}><Character who="kid" expr="sad" pose="desk" t={t} width={290} drop={14} tilt={6} look={[0, 0.8]} /></div>
          <div style={{position: 'absolute', left: 430, top: 110}}><Text3D text="ANAK MULA RASA…" at={T.dan + 0.1} size={72} anim="soft" {...LOOK.white} tiltX={6} float={false} /></div>
        </Panel>
      </Layer>
      {/* emotional close-up: the third panel opens up into a soft, dim scene */}
      {t >= T.expand - 0.05 ? (
        <AbsoluteFill style={{clipPath: `inset(${lerp(panelTop(2), 0, sad)}px ${lerp(40, 0, sad)}px ${lerp(1920 - panelTop(2) - PANEL_H, 0, sad)}px ${lerp(40, 0, sad)}px round ${lerp(40, 0, sad)}px)`}}>
          <StudyRoom mood="dim" />
          <Layer depth={0.85}>
            <At x={540} y={940}>
              <Character who="kid" expr="sad" pose="desk" t={t} width={560} drop={lerp(10, 34, prog(t, T.expand, T.pandai))} tilt={5} look={[0, 0.9]} />
            </At>
          </Layer>
          <Layer depth={1}>
            <Desk y={1180} dim />
            <AbsoluteFill style={{background: 'radial-gradient(70% 55% at 50% 52%, rgba(255,214,150,0.18), rgba(3,8,26,0.65) 100%)'}} />
          </Layer>
          <Particles count={18} color="#C9D6FF" seed={9} size={5} rise={-14} />
          {/* thought cloud */}
          <div style={{position: 'absolute', left: 540, top: 430, width: 0, height: 0, transform: `scale(${think})`, opacity: Math.min(1, think * 1.4)}}>
            <svg width={860} height={330} viewBox="0 0 860 330" style={{position: 'absolute', left: -430, top: -165, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.4))'}}>
              <path d="M120 250 Q40 250 50 180 Q30 110 110 100 Q120 30 210 40 Q260 -5 340 30 Q420 -10 500 30 Q590 0 640 55 Q740 45 760 120 Q830 150 800 215 Q790 270 700 260 Q650 310 560 285 Q480 320 400 285 Q300 320 240 280 Q170 300 120 250 Z"
                fill="rgba(240,244,255,0.94)" />
              <circle cx="330" cy="300" r="20" fill="rgba(240,244,255,0.94)" /><circle cx="300" cy="330" r="12" fill="rgba(240,244,255,0.94)" />
            </svg>
            <div style={{position: 'absolute', left: -400, top: -112, textAlign: 'center', width: 800}}>
              <Text3D text={'"SAYA TAK'} at={T.saya} size={100} anim="soft" face={['#3A63C9', C.navy]} side="#9AA9CF" depth={6} tiltX={6} stagger={0.05} />
              <div><Text3D text={'PANDAI…"'} at={T.pandai - 0.15} size={100} anim="soft" face={['#3A63C9', C.navy]} side="#9AA9CF" depth={6} tiltX={6} stagger={0.06} /></div>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </Stage>
  );
};
