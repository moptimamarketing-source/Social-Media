import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {At, Layer, Stage} from '../components/Camera';
import {Background} from '../components/Background';
import {Text3D, LOOK} from '../components/Text3D';
import {Character} from '../components/Character';
import {OpenBook} from '../components/Book3D';
import {ArrowDown, Clock3D} from '../components/Icons';
import {Pop} from '../components/Motion';
import {EI, EIO, lerp, prog, sp, useT} from '../lib/time';
import {S7 as T} from '../data/timeline';

/** Word on the page that stutters: syllables jitter and leave ghost echoes. */
const StutterWord: React.FC<{parts: string[]; at: number; step: number; size: number}> = ({parts, at, step, size}) => {
  const {t} = useT();
  return (
    <div style={{display: 'flex', gap: 10, fontFamily: F.display, fontSize: size, color: C.navy, lineHeight: 1}}>
      {parts.map((p, i) => {
        const a = at + i * step;
        const on = prog(t, a, a + 0.08);
        const jit = t > a && t < a + 0.6 ? Math.sin(t * 60 + i) * 6 : 0;
        return (
          <span key={i} style={{position: 'relative', opacity: on, transform: `translateX(${jit}px)`}}>
            {[1, 2].map((g) => (
              <span key={g} style={{position: 'absolute', left: g * 10, top: 0, color: C.red, opacity: on * 0.25 * (t < a + 0.8 ? 1 : 0.3), filter: 'blur(2px)'}}>{p}</span>
            ))}
            <span style={{position: 'relative'}}>{p}</span>
            {i < parts.length - 1 ? <span style={{color: C.red}}>…</span> : null}
          </span>
        );
      })}
    </div>
  );
};

/** Pointing finger that keeps tapping the same spot (stuck). */
const Finger: React.FC = () => {
  const {t} = useT();
  const tap = Math.abs(Math.sin(t * 7)) * 18;
  return (
    <svg width={120} height={170} viewBox="0 0 120 170" style={{transform: `translateY(${tap}px) rotate(-12deg)`, filter: 'drop-shadow(0 12px 12px rgba(0,0,0,0.35))'}}>
      <rect x="44" y="0" width="30" height="90" rx="15" fill={C.skin} stroke={C.skinShade} strokeWidth="3" />
      <rect x="20" y="70" width="84" height="80" rx="34" fill={C.skin} stroke={C.skinShade} strokeWidth="3" />
      <rect x="10" y="140" width="104" height="30" rx="10" fill={C.sky} />
    </svg>
  );
};

/** SCENE 7 — "Jadi kalau anak masih tersekat-sekat, jangan tunggu sampai dia makin besar dan makin down." */
export const S7Pesanan: React.FC = () => {
  const {t, f, fps} = useT();
  const urgent = t > T.jangan;
  const bookOut = prog(t, T.makin - 0.25, T.makin + 0.15, EI);
  const growth = [T.makin, T.besar, T.makin2 - 0.1, T.down - 0.1].filter((x) => t >= x).length;
  const kidIn = sp(f, fps, T.makin - 0.1, {damping: 14, stiffness: 120});
  const age = 7 + Math.max(0, growth - 1);
  const ring = (at: number) => {
    const k = prog(t, at, at + 0.5);
    return k > 0 && k < 1 ? <At x={540} y={380}><div style={{width: 900 * k, height: 900 * k * 0.5, borderRadius: '50%', border: `${12 * (1 - k)}px solid ${C.yellow}`, opacity: 1 - k}} /></At> : null;
  };
  return (
    <Stage keys={[{t: T.start, zoom: 1.08}, {t: T.kalau, zoom: 1.0}, {t: T.tersekat, zoom: 1.1, y: 60}, {t: T.jangan, zoom: 1.0, y: 0}, {t: T.makin, zoom: 1.02}, {t: T.end, zoom: 1.1}]}
      shakes={[{t: T.jangan + 0.05, amp: 18}, {t: T.tunggu + 0.05, amp: 14}]}>
      <Layer depth={0.1}><Background variant="urgent" /></Layer>
      <Layer depth={0.45}>
        <At x={540} y={900} style={{transform: `translate(-50%,-50%) scale(${lerp(0.9, 1.05, prog(t, T.start, T.end))})`, opacity: lerp(0.95, 0.55, bookOut)}}>
          <Clock3D size={680} t={t} speed={urgent ? 90 : 6} />
        </At>
      </Layer>
      <Layer depth={0.9}>
        {/* hard-to-read book close-up */}
        <At x={540} y={1150} style={{transform: `translate(-50%,-50%) translateY(${bookOut * 500}px)`, opacity: 1 - bookOut}}>
          <div style={{perspective: 1000}}>
            <OpenBook w={360} h={300} tilt={38} words={[
              <div key="l" style={{position: 'absolute', left: 40, top: 60}}><StutterWord parts={['BU', 'KU']} at={T.kalau} step={0.45} size={70} /></div>,
              <div key="r" style={{position: 'absolute', left: 30, top: 60}}><StutterWord parts={['SE', 'KO', 'LAH']} at={T.tersekat - 0.3} step={0.35} size={64} /></div>,
            ]} />
          </div>
          <div style={{position: 'absolute', left: 470, top: 20}}><Finger /></div>
        </At>
        <At x={540} y={600} style={{opacity: 1 - bookOut}}>
          <Pop at={T.tersekat} from="scale">
            <div style={{fontFamily: F.display, fontSize: 92, color: C.white, background: C.red, padding: '10px 34px 0', borderRadius: 26, whiteSpace: 'nowrap',
              transform: `rotate(-4deg) translateX(${Math.sin(t * 40) * (t < T.tersekat + 0.8 ? 6 : 0)}px)`, boxShadow: '0 10px 0 #7A1518, 0 22px 30px rgba(0,0,0,0.4)'}}>TER… SE… KAT…</div>
          </Pop>
        </At>
        {/* time passes: calendar + growing kid + falling arrow */}
        {t > T.makin - 0.2 ? (
          <>
            <At x={250} y={1000} style={{transform: `translate(-50%,-50%) scale(${kidIn})`}}>
              <div style={{width: 300, height: 320, borderRadius: 30, background: C.white, boxShadow: '0 24px 40px rgba(0,0,0,0.45)', overflow: 'hidden', perspective: 800}}>
                <div style={{height: 90, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontWeight: 800, fontSize: 34, color: C.white, letterSpacing: 4}}>UMUR</div>
                <div key={age} style={{fontFamily: F.display, fontSize: 150, color: C.navy, textAlign: 'center', lineHeight: 1.3,
                  transform: `rotateX(${(1 - Math.min(1, (t - [T.makin, T.besar, T.makin2 - 0.1, T.down - 0.1][Math.max(0, growth - 1)]) * 6)) * -90}deg)`, transformOrigin: '50% 0'}}>{age}</div>
                <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 30, color: C.navyMid, textAlign: 'center', marginTop: -24}}>TAHUN</div>
              </div>
            </At>
            <At x={740} y={1080} style={{transform: `translate(-50%,-50%) scale(${kidIn * (0.8 + growth * 0.08)})`, transformOrigin: '50% 100%'}}>
              <Character who="kid" expr={growth >= 3 ? 'sad' : 'worried'} pose="rest" t={t} width={420} drop={growth >= 3 ? 16 : 0} look={[0, 0.8]} />
            </At>
            <At x={880} y={700}><Pop at={T.makin2} from="down" dist={200}><ArrowDown size={240} /></Pop></At>
          </>
        ) : null}
      </Layer>
      <Layer depth={1}>
        {ring(T.jangan)}
        {ring(T.tunggu)}
        <div style={{position: 'absolute', left: 0, right: 0, top: 235, textAlign: 'center'}}>
          <Text3D text="JANGAN" at={T.jangan} size={150} anim="slam" stagger={0.015} {...LOOK.white} />
          <div style={{marginTop: -6}}>
            <Text3D text="TUNGGU" at={T.tunggu} size={150} anim="slam" stagger={0.015} {...LOOK.yellow} />
            <Text3D text=" LAGI!" at={T.sampai} size={92} anim="elastic" {...LOOK.red} style={{marginLeft: 10}} />
          </div>
        </div>
      </Layer>
      <AbsoluteFill style={{background: `radial-gradient(80% 60% at 50% 50%, transparent 50%, rgba(229,72,77,${urgent ? 0.18 + Math.max(0, Math.sin(t * 8)) * 0.08 : 0}) 100%)`, pointerEvents: 'none'}} />
    </Stage>
  );
};
