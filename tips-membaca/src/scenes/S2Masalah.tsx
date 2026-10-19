import React from 'react';
import {C, F} from '../theme';
import {At, Layer, Stage} from '../components/Camera';
import {StudyRoom, Desk} from '../components/Room';
import {Text3D, LOOK} from '../components/Text3D';
import {Character} from '../components/Character';
import {Book3D, OpenBook} from '../components/Book3D';
import {Pop, Float} from '../components/Motion';
import {Particles} from '../components/Background';
import {HEAVY, lerp, prog, sp, useT} from '../lib/time';
import {S2 as T} from '../data/timeline';

const LETTERS = ['b', 'd', 'p', 'q', 'm', 'n', 'u', '?'];

/** Worksheet that flies in and lands around the desk. */
const Sheet: React.FC<{at: number; x: number; y: number; rot: number; from: [number, number]}> = ({at, x, y, rot, from}) => {
  const {t, f, fps} = useT();
  if (t < at) return null;
  const s = sp(f, fps, at, {damping: 14, stiffness: 120});
  return (
    <div style={{position: 'absolute', left: lerp(from[0], x, s), top: lerp(from[1], y, s), transform: `translate(-50%,-50%) rotate(${lerp(rot + 200, rot, s)}deg)`,
      width: 190, height: 250, background: '#FFFDF6', borderRadius: 10, boxShadow: '0 16px 26px rgba(0,0,0,0.35)', padding: 18, boxSizing: 'border-box'}}>
      <div style={{fontFamily: F.display, fontSize: 26, color: C.navy}}>LATIHAN</div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{height: 8, margin: '14px 0', borderRadius: 4, background: i === 2 ? '#F7A1A3' : '#C9D3EA', width: `${90 - i * 9}%`}} />
      ))}
      <div style={{position: 'absolute', right: 14, bottom: 10, fontFamily: F.display, fontSize: 54, color: C.red, transform: 'rotate(-12deg)'}}>✗</div>
    </div>
  );
};

/** SCENE 2 — "Bila anak tak lancar membaca, semua benda jadi berat." */
export const S2Masalah: React.FC = () => {
  const {t, f, fps} = useT();
  const stack = sp(f, fps, T.semua + 0.05, HEAVY);
  const weight = sp(f, fps, T.berat, HEAVY);
  const heavy = t > T.berat + 0.1;
  return (
    <Stage keys={[{t: T.start, zoom: 1.12, y: 40}, {t: T.tak, zoom: 1.04, y: 0}, {t: T.semua, zoom: 1.0}, {t: T.end, zoom: 1.08, y: 30}]}
      shakes={[{t: T.semua + 0.2, amp: 10}, {t: T.berat + 0.15, amp: 16}]}>
      <StudyRoom />
      <Layer depth={0.6}>
        {/* confusing letters swirling out of the book */}
        {LETTERS.map((ch, i) => {
          const a = t * (0.9 + i * 0.07) + i * 0.8;
          const r = 230 + (i % 3) * 60;
          const k = prog(t, T.start + 0.2 + i * 0.08, T.start + 0.9 + i * 0.08);
          return (
            <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * r * k - 40, top: 800 + Math.sin(a) * 140 * k - 50, fontFamily: F.display, fontSize: 100,
              color: i % 2 ? C.yellow : C.white, transform: `rotateY(${Math.sin(t * 3 + i) * 180}deg) rotate(${Math.sin(t * 2 + i) * 25}deg)`, opacity: k * (heavy ? 0.4 : 0.95),
              textShadow: `0 6px 0 ${C.navyMid}, 0 14px 18px rgba(0,0,0,0.35)`}}>{ch}</div>
          );
        })}
      </Layer>
      <Layer depth={0.8}>
        <At x={540} y={880}>
          <Character who="kid" expr={heavy ? 'worried' : 'confused'} pose={heavy ? 'desk' : 'chin'} t={t} width={540} look={heavy ? [0, 0.6] : [Math.sin(t * 2) * 0.8, 0.3]}
            drop={heavy ? lerp(0, 26, prog(t, T.berat + 0.1, T.berat + 0.5)) : 0} tilt={heavy ? 4 : Math.sin(t * 1.5) * 4} />
        </At>
      </Layer>
      <Layer depth={1}>
        <Desk y={1150} />
        <At x={540} y={1215}><div style={{perspective: 1000}}><OpenBook w={170} h={200} tilt={62} flip={(t * 0.8) % 1} /></div></At>
        <Sheet at={T.membaca - 0.3} x={150} y={1250} rot={-14} from={[-200, 900]} />
        <Sheet at={T.membaca - 0.15} x={930} y={1240} rot={12} from={[1300, 800]} />
        <Sheet at={T.membaca} x={250} y={1290} rot={8} from={[-200, 1500]} />
        {/* heavy pile + weight */}
        {t > T.semua ? (
          <div style={{position: 'absolute', left: 860, top: lerp(-600, 1060, stack), transform: 'translate(-50%,-50%)', perspective: 1000}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{position: 'absolute', left: -120, top: -i * 62, transform: `rotate(${(i - 1) * 4}deg)`}}>
                <Book3D w={240} h={70} d={170} color={[C.red, C.blue, C.orange][i]} rotX={-60} rotY={-10} />
              </div>
            ))}
          </div>
        ) : null}
        {t > T.berat - 0.05 ? (
          <div style={{position: 'absolute', left: 860, top: lerp(-500, 880, weight), transform: 'translate(-50%,-50%)'}}>
            <svg width={250} height={230} viewBox="0 0 250 230" style={{filter: 'drop-shadow(0 18px 20px rgba(0,0,0,0.45))'}}>
              <defs><linearGradient id="wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5B6B93" /><stop offset="1" stopColor="#1A2443" /></linearGradient></defs>
              <path d="M85 60 Q85 10 125 10 Q165 10 165 60" stroke="#2A3557" strokeWidth="22" fill="none" />
              <path d="M40 70 H210 L240 220 H10 Z" fill="url(#wt)" />
              <text x="125" y="170" textAnchor="middle" fontFamily="Baloo" fontSize="58" fill={C.yellow}>BERAT</text>
            </svg>
          </div>
        ) : null}
      </Layer>
      <Layer depth={1}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 235, textAlign: 'center'}}>
          <Text3D text="TAK LANCAR" at={T.tak} size={128} anim="slam" stagger={0.02} {...LOOK.white} />
          <div style={{marginTop: -4}}><Text3D text="MEMBACA?" at={T.lancar + 0.2} size={150} anim="elastic" {...LOOK.yellow} /></div>
        </div>
        <At x={540} y={1070}><Pop at={T.berat + 0.4} from="scale"><Float amp={6}><div style={{fontFamily: F.display, fontSize: 60, color: C.white, background: C.red,
          padding: '8px 26px 2px', borderRadius: 20, transform: 'rotate(-4deg)', boxShadow: '0 10px 20px rgba(0,0,0,0.35)'}}>SEMUA JADI BERAT!</div></Float></Pop></At>
      </Layer>
      <Particles count={10} color="#FFFFFF" seed={5} size={6} rise={20} />
    </Stage>
  );
};
