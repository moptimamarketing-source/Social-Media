import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {At, Layer, Stage} from '../components/Camera';
import {Background, Particles} from '../components/Background';
import {Text3D, LOOK} from '../components/Text3D';
import {Block3D, Book3D} from '../components/Book3D';
import {ChatBubble, Heart, Pencil, ShareArrow, Star} from '../components/Icons';
import {Float} from '../components/Motion';
import {EI, ELASTIC, lerp, prog, sp, useT} from '../lib/time';
import {S9 as T} from '../data/timeline';

/** 3D round action button (comment / like / share) that pops in on its word and gets a tap. */
const ActionButton: React.FC<{at: number; label: string; color: string; children: React.ReactNode}> = ({at, label, color, children}) => {
  const {t, f, fps} = useT();
  if (t < at - 0.02) return <div style={{width: 250}} />;
  const s = sp(f, fps, at, ELASTIC);
  const tap = t > at + 0.35 && t < at + 0.6 ? Math.sin(((t - at - 0.35) / 0.25) * Math.PI) * 0.1 : 0;
  const ring = prog(t, at + 0.35, at + 0.9);
  return (
    <div style={{width: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, transform: `scale(${s}) translateY(${(1 - Math.min(1, s)) * 60}px)`}}>
      <div style={{position: 'relative', width: 200, height: 200}}>
        <div style={{position: 'absolute', inset: 0, top: 14, borderRadius: '50%', background: '#030A1F'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 38% 30%, #ffffff55, ${color} 55%)`,
          border: '6px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${tap * 60}px) scale(${1 - tap})`}}>
          {children}
        </div>
        {ring > 0 && ring < 1 ? <div style={{position: 'absolute', inset: -ring * 60, borderRadius: '50%', border: `${8 * (1 - ring)}px solid ${C.yellow}`, opacity: 1 - ring}} /> : null}
      </div>
      <Text3D text={label} at={at + 0.05} size={58} anim="flip" {...LOOK.white} depth={6} tiltX={8} float={false} />
    </div>
  );
};

/** SCENE 9 — "Kalau nak tahu macam mana teknik ni berfungsi untuk anak anda... Komen, like dan share!" */
export const S9CTA: React.FC = () => {
  const {t, f, fps} = useT();
  const titleOut = prog(t, T.logo - 0.1, T.logo + 0.3, EI);
  const logo = sp(f, fps, T.logo, {damping: 12, stiffness: 140});
  const floaters: {x: number; y: number; d: number; el: React.ReactNode}[] = [
    {x: 140, y: 380, d: 0.3, el: <Book3D w={130} h={170} d={36} color={C.yellow} rotY={-30 + Math.sin(t) * 20} />},
    {x: 950, y: 330, d: 0.5, el: <Block3D w={110} h={110} d={110} color={C.white} label="A" rotY={t * 40} />},
    {x: 110, y: 760, d: 0.6, el: <Block3D w={100} h={100} d={100} color={C.yellow} label="B" rotY={-t * 50} />},
    {x: 975, y: 640, d: 0.4, el: <Book3D w={120} h={160} d={34} color={C.blue} rotY={30 + Math.sin(t * 1.2) * 20} />},
    {x: 930, y: 880, d: 0.25, el: <Pencil size={170} style={{transform: 'rotate(40deg)'}} />},
    {x: 180, y: 1290, d: 0.2, el: <Star size={60} />},
  ];
  return (
    <Stage keys={[{t: T.start, zoom: 1.15}, {t: T.tahu, zoom: 1.0}, {t: T.komen, zoom: 1.03, y: 20}, {t: T.end, zoom: 1.06, y: 20}]} shakes={[{t: T.teknik + 0.05, amp: 8}]}>
      <Layer depth={0.1}><Background variant="navy" rays raysColor="rgba(255,255,255,0.07)" /></Layer>
      {floaters.map((fl, i) => (
        <Layer key={i} depth={fl.d}>
          <At x={fl.x} y={fl.y} style={{filter: fl.d < 0.35 ? 'blur(3px)' : undefined, opacity: lerp(0.6, 1, fl.d)}}>
            <Float phase={i * 1.3} amp={22} rot={10}><div style={{perspective: 900}}>{fl.el}</div></Float>
          </At>
        </Layer>
      ))}
      <Layer depth={0.4}><Particles count={28} seed={51} rise={35} /></Layer>
      <Layer depth={1}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: 1 - titleOut, transform: `translateY(${-titleOut * 80}px)`}}>
          <Text3D text="NAK TAHU" at={T.kalau + 0.3} size={120} anim="flip" {...LOOK.white} stagger={0.03} />
          <div style={{marginTop: -2}}><Text3D text="TEKNIK" at={T.teknik} size={190} anim="slam" {...LOOK.yellow} stagger={0.02} /></div>
          <div style={{marginTop: -6}}><Text3D text="MEMBACA?" at={T.berfungsi} size={130} anim="elastic" {...LOOK.white} /></div>
        </div>
        {/* logo / wordmark */}
        {t > T.logo - 0.05 ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', transform: `scale(${logo})`}}>
            <Text3D text="MINDA" at={T.logo} size={150} anim="none" {...LOOK.white} float={false} />
            <div style={{marginTop: -10}}><Text3D text="OPTIMA" at={T.logo} size={150} anim="none" {...LOOK.yellow} float={false} /></div>
            <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 34, color: C.white, letterSpacing: 6, marginTop: 6, opacity: prog(t, T.logo + 0.2, T.logo + 0.5)}}>PROGRAM MEMBACA KANAK-KANAK</div>
          </div>
        ) : null}
        <div style={{position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center', gap: 50}}>
          <ActionButton at={T.komen} label="KOMEN" color={C.blue}><ChatBubble size={110} /></ActionButton>
          <ActionButton at={T.like} label="LIKE" color={C.red}><Heart size={110} color="#FFFFFF" /></ActionButton>
          <ActionButton at={T.share} label="SHARE" color={C.yellowDeep}><ShareArrow size={104} /></ActionButton>
        </div>
      </Layer>
      <AbsoluteFill style={{pointerEvents: 'none'}} />
    </Stage>
  );
};
