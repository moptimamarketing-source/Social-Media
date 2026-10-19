import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {At, Layer, Stage} from '../components/Camera';
import {Background, Particles} from '../components/Background';
import {Text3D, LOOK} from '../components/Text3D';
import {Book3D, OpenBook} from '../components/Book3D';
import {Atom, CheckBadge, Key} from '../components/Icons';
import {Float, Pop} from '../components/Motion';
import {EIO, ELASTIC, lerp, POP, prog, sp, useT} from '../lib/time';
import {S4 as T} from '../data/timeline';

const CENTER: [number, number] = [540, 975];

type Subj = {key: string; label: string; at: number; pos: [number, number]; color: string; titleColor: string; anim: 'flip' | 'pop' | 'spin' | 'drop'};

const SUBJECTS: Subj[] = [
  {key: 'bm', label: 'BAHASA MELAYU', at: T.bm, pos: [255, 735], color: C.yellow, titleColor: C.navy, anim: 'flip'},
  {key: 'en', label: 'ENGLISH', at: T.en, pos: [825, 735], color: C.white, titleColor: C.navy, anim: 'pop'},
  {key: 'sains', label: 'SAINS', at: T.sains, pos: [255, 1165], color: C.blue, titleColor: C.white, anim: 'spin'},
  {key: 'maths', label: 'MATHS', at: T.maths, pos: [825, 1165], color: C.orange, titleColor: C.white, anim: 'drop'},
];

const SubjectIcon: React.FC<{k: string; t: number}> = ({k, t}) => {
  if (k === 'bm') return <div style={{fontFamily: F.display, fontSize: 74, color: C.navy, transform: `translateY(${Math.abs(Math.sin(t * 5)) * -8}px)`}}>Aa</div>;
  if (k === 'en') return <div style={{fontFamily: F.display, fontSize: 52, color: C.white, background: C.blue, borderRadius: 18, padding: '2px 14px 0'}}>ABC</div>;
  if (k === 'sains') return <Atom size={96} t={t} />;
  return <div style={{fontFamily: F.display, fontSize: 64, color: C.white, transform: `rotate(${t * 60}deg)`}}>÷</div>;
};

/** A subject book that flies out of the open book, each with its own entrance. */
const Subject: React.FC<{s: Subj; i: number}> = ({s, i}) => {
  const {t, f, fps} = useT();
  if (t < s.at - 0.05) return null;
  const k = sp(f, fps, s.at, s.anim === 'drop' ? {damping: 14, stiffness: 170, mass: 1} : s.anim === 'pop' ? ELASTIC : POP);
  const fly = Math.min(1, k);
  let x = lerp(CENTER[0], s.pos[0], fly);
  let y = lerp(CENTER[1], s.pos[1], fly) - Math.sin(fly * Math.PI) * 160;
  let extra = '';
  if (s.anim === 'drop') {
    x = s.pos[0];
    y = lerp(-300, s.pos[1], Math.min(1, k));
  } else if (s.anim === 'spin') {
    extra = `rotateY(${(1 - k) * 720}deg)`;
  } else if (s.anim === 'flip') {
    extra = `rotateX(${(1 - k) * 360}deg)`;
  } else {
    extra = `scale(${k})`;
  }
  const checked = t >= [T.semua + 0.38, T.semua + 0.9, T.faham, T.faham + 0.3][i];
  const pulse = 1 + Math.max(0, Math.sin((t - s.at) * 6)) * 0.05;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0}}>
      <div style={{position: 'absolute', left: -110, top: -150, width: 220, perspective: 1000, transform: `${extra} scale(${pulse})`, transformStyle: 'preserve-3d'}}>
        <Float phase={i} amp={8} rot={2}>
          <Book3D w={190} h={240} d={50} color={s.color} titleColor={s.titleColor} rotY={i % 2 ? -24 : 24} rotX={-10} icon={<SubjectIcon k={s.key} t={t} />} />
        </Float>
      </div>
      <div style={{position: 'absolute', left: -250, width: 500, top: 108, textAlign: 'center', opacity: prog(t, s.at + 0.1, s.at + 0.3)}}>
        <Text3D text={s.label} at={s.at + 0.08} size={s.label.length > 8 ? 46 : 58} anim="flip" {...LOOK.white} tiltX={6} depth={6} float={false} stagger={0.015} />
      </div>
      {checked ? <div style={{position: 'absolute', left: 50, top: -190}}><Pop at={[T.semua + 0.38, T.semua + 0.9, T.faham, T.faham + 0.3][i]}><CheckBadge ok size={84} /></Pop></div> : null}
    </div>
  );
};

/** SCENE 4 — "Membaca ni penting sebab dia kunci semua subjek seperti Bahasa Melayu, English, Sains, Maths, semua perlukan anak faham arahan." */
export const S4Kunci: React.FC = () => {
  const {t, f, fps} = useT();
  const open = prog(t, T.membaca, T.membaca + 0.8, EIO);
  const keyIn = sp(f, fps, T.kunci - 0.1, {damping: 14, stiffness: 90});
  const keyOut = prog(t, T.seperti, T.seperti + 0.4, EIO);
  const beams = prog(t, T.semua, T.semua + 0.6);
  const bookScale = lerp(1.35, 1, prog(t, T.kunci, T.seperti + 0.3, EIO));
  return (
    <Stage keys={[{t: T.start, zoom: 1.15, y: 60}, {t: T.penting, zoom: 1.05, y: 20}, {t: T.kunci, zoom: 1.02, y: 0, rotY: 0}, {t: T.seperti, zoom: 1.0, rotY: -5},
      {t: T.sains, zoom: 1.02, rotY: 5}, {t: T.semua, zoom: 1.0, rotY: -3}, {t: T.end, zoom: 1.06, rotY: 3}]}>
      <Layer depth={0.1}><Background variant="navy" rays raysColor="rgba(255,210,63,0.13)" /></Layer>
      <Layer depth={0.4}><Particles count={30} seed={11} rise={70} /></Layer>
      <Layer depth={0.9}>
        {/* light pouring out of the book */}
        <At x={CENTER[0]} y={CENTER[1] - 120}>
          <div style={{width: 760, height: 760, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,233,150,${0.75 * open}) 0%, rgba(255,210,63,${0.3 * open}) 30%, transparent 65%)`}} />
        </At>
        <At x={CENTER[0]} y={CENTER[1] - 260}>
          <div style={{width: 420, height: 520, opacity: open * 0.75, background: 'linear-gradient(0deg, rgba(255,238,170,0.85), transparent)',
            clipPath: 'polygon(38% 100%, 62% 100%, 100% 0, 0 0)', filter: 'blur(6px)'}} />
        </At>
        <At x={CENTER[0]} y={CENTER[1]} style={{transform: `translate(-50%,-50%) scale(${bookScale})`}}>
          <div style={{perspective: 1100}}><OpenBook w={200} h={250} tilt={58} open={open} flip={t > T.membaca + 0.8 ? ((t - T.membaca) * 0.5) % 1 : 0} color={C.navyMid} /></div>
        </At>
        {/* beams to every subject */}
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: beams}}>
          {SUBJECTS.map((s, i) => (
            <line key={i} x1={CENTER[0]} y1={CENTER[1] - 40} x2={s.pos[0]} y2={s.pos[1]} stroke={C.yellow} strokeWidth={8} strokeLinecap="round"
              strokeDasharray="18 22" strokeDashoffset={-t * 120} style={{filter: 'drop-shadow(0 0 10px #FFD23F)'}} />
          ))}
        </svg>
        {SUBJECTS.map((s, i) => <Subject key={s.key} s={s} i={i} />)}
        {/* the key */}
        {t > T.kunci - 0.1 && keyOut < 1 ? (
          <At x={540} y={lerp(CENTER[1], 760, keyIn)} style={{transform: `translate(-50%,-50%) scale(${keyIn * (1 - keyOut)}) rotateY(${t * 160}deg)`, opacity: 1 - keyOut}}>
            <Key size={300} />
          </At>
        ) : null}
        <At x={540} y={1105}>
          <Pop at={T.arahan - 0.1} from="up" dist={80}>
            <div style={{fontFamily: F.display, fontSize: 46, color: C.navy, background: C.yellow, padding: '12px 34px 4px', borderRadius: 999, whiteSpace: 'nowrap',
              boxShadow: `0 8px 0 ${C.yellowDark}, 0 20px 30px rgba(0,0,0,0.4)`}}>FAHAM ARAHAN ✓</div>
          </Pop>
        </At>
      </Layer>
      <Layer depth={1}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center'}}>
          <Text3D text="MEMBACA =" at={T.membaca + 0.1} size={124} anim="elastic" {...LOOK.white} />
          <div style={{marginTop: -2}}><Text3D text="KUNCI SEMUA SUBJEK" at={T.kunci} size={92} anim="flip" {...LOOK.yellow} stagger={0.025} /></div>
        </div>
        <At x={850} y={575}><Pop at={T.penting} until={T.seperti - 0.2} from="scale"><div style={{fontFamily: F.display, fontSize: 46, color: C.white, background: C.red, padding: '6px 20px 0',
          borderRadius: 16, transform: 'rotate(10deg)', boxShadow: '0 10px 18px rgba(0,0,0,0.4)'}}>PENTING!</div></Pop></At>
      </Layer>
      <AbsoluteFill style={{pointerEvents: 'none'}} />
    </Stage>
  );
};
