import React from 'react';
import {C, F} from '../theme';
import {mix} from '../lib/color';

type BookProps = {
  w?: number;
  h?: number;
  d?: number;
  color?: string;
  title?: string;
  titleColor?: string;
  icon?: React.ReactNode;
  rotX?: number;
  rotY?: number;
  rotZ?: number;
  /** 0 = closed, 1 = front cover swung open */
  open?: number;
};

const face = (w: number, h: number, transform: string, style: React.CSSProperties): React.CSSProperties => ({
  position: 'absolute', left: '50%', top: '50%', width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2, transform, backfaceVisibility: 'hidden', ...style,
});

const pagesBg = (vertical: boolean) => ({
  background: `repeating-linear-gradient(${vertical ? 90 : 0}deg, #FBF8EF 0px, #FBF8EF 3px, #E6E0CF 3px, #E6E0CF 4px)`,
});

/** Real CSS-3D hardback: six faces, cover can swing open. */
export const Book3D: React.FC<BookProps> = ({w = 260, h = 340, d = 60, color = C.blue, title, titleColor = C.white, icon, rotX = -12, rotY = -28, rotZ = 0, open = 0}) => {
  const dark = mix(color, '#000000', 0.35);
  return (
    <div style={{width: w, height: h, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`}}>
      {/* back cover */}
      <div style={face(w, h, `rotateY(180deg) translateZ(${d / 2}px)`, {background: dark, borderRadius: '4px 14px 14px 4px'})} />
      {/* page block */}
      <div style={face(d - 8, h - 14, `rotateY(90deg) translateZ(${w / 2 - 6}px)`, pagesBg(true))} />
      <div style={face(w - 14, d - 8, `rotateX(90deg) translateZ(${h / 2 - 6}px)`, pagesBg(false))} />
      <div style={face(w - 14, d - 8, `rotateX(-90deg) translateZ(${h / 2 - 6}px)`, pagesBg(false))} />
      {/* spine */}
      <div style={face(d, h, `rotateY(-90deg) translateZ(${w / 2}px)`, {background: `linear-gradient(90deg, ${dark}, ${mix(color, '#000000', 0.15)} 50%, ${dark})`,
        borderRadius: 6})} />
      {/* inner first page (seen when the cover opens) */}
      <div style={face(w - 12, h - 14, `translateZ(${d / 2 - 4}px)`, {background: 'linear-gradient(90deg, #E9E3D2, #FFFDF6 30%)', borderRadius: 4})}>
        <div style={{position: 'absolute', inset: '18% 14%', background: 'repeating-linear-gradient(0deg, transparent 0 22px, #C9D3EA 22px 26px)'}} />
      </div>
      {/* front cover */}
      <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: 'left center', transformStyle: 'preserve-3d',
        transform: `translateZ(${d / 2}px) rotateY(${-open * 155}deg)`}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: '4px 16px 16px 4px', background: `linear-gradient(135deg, ${mix(color, '#ffffff', 0.22)}, ${color} 45%, ${mix(color, '#000000', 0.2)})`,
          boxShadow: 'inset 10px 0 0 rgba(0,0,0,0.18), inset -3px 0 0 rgba(255,255,255,0.25)', backfaceVisibility: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: -w * 0.4, top: 0, width: w * 0.5, height: h * 1.4, transform: 'rotate(18deg)', background: 'rgba(255,255,255,0.13)'}} />
          {icon}
          {title ? <div style={{fontFamily: F.display, fontSize: Math.min(56, w / (title.length * 0.55)), color: titleColor, textAlign: 'center', lineHeight: 1, padding: '0 14px',
            textShadow: '0 3px 0 rgba(0,0,0,0.25)'}}>{title}</div> : null}
        </div>
        <div style={{position: 'absolute', inset: 0, borderRadius: '16px 4px 4px 16px', background: mix(color, '#ffffff', 0.55), transform: 'rotateY(180deg)', backfaceVisibility: 'hidden'}} />
      </div>
    </div>
  );
};

/** Open book lying on a tilted plane with a page that keeps turning. `flip` 0..1 drives the turning page. */
export const OpenBook: React.FC<{w?: number; h?: number; tilt?: number; flip?: number; open?: number; color?: string; words?: React.ReactNode[]}> = ({
  w = 300, h = 400, tilt = 58, flip = 0, open = 1, color = C.navyMid, words,
}) => {
  const page = (side: 'L' | 'R', content?: React.ReactNode): React.CSSProperties & {children?: React.ReactNode} => ({
    position: 'absolute', top: 0, width: w, height: h, left: side === 'L' ? 0 : w,
    background: side === 'L' ? 'linear-gradient(90deg, #F4EFE1 0%, #FFFDF7 70%, #DCD3BC 100%)' : 'linear-gradient(90deg, #D5CCB4 0%, #FFFDF7 30%, #F4EFE1 100%)',
    borderRadius: side === 'L' ? '18px 4px 4px 18px' : '4px 18px 18px 4px',
  });
  const lines = (
    <div style={{position: 'absolute', inset: '12% 12%', background: 'repeating-linear-gradient(0deg, transparent 0 26px, #C6CFE6 26px 31px)', opacity: 0.9}} />
  );
  return (
    <div style={{width: w * 2, height: h, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${tilt}deg)`}}>
      <div style={{position: 'absolute', inset: -16, borderRadius: 24, background: `linear-gradient(180deg, ${mix(color, '#ffffff', 0.15)}, ${color})`, transform: 'translateZ(-14px)',
        boxShadow: '0 40px 60px rgba(0,0,0,0.5)'}} />
      <div style={{...page('L'), transformOrigin: 'right center', transform: `rotateY(${(1 - open) * 170}deg)`}}>{lines}{words?.[0]}</div>
      <div style={page('R')}>{lines}{words?.[1]}</div>
      {flip > 0 && flip < 1 ? (
        <div style={{...page('R'), transformOrigin: 'left center', transform: `translateZ(2px) rotateY(${-flip * 180}deg)`,
          filter: `brightness(${1 - Math.sin(flip * Math.PI) * 0.25})`}}>{lines}</div>
      ) : null}
      <div style={{position: 'absolute', left: w - 6, top: 0, width: 12, height: h, background: 'linear-gradient(90deg, rgba(0,0,0,0.25), transparent, rgba(0,0,0,0.25))'}} />
    </div>
  );
};

/** Solid 3D block (cube or slab) with a label on the front and top. */
export const Block3D: React.FC<{w: number; h: number; d: number; color: string; label?: string; labelColor?: string; rotX?: number; rotY?: number; fontSize?: number}> = ({
  w, h, d, color, label, labelColor = C.navy, rotX = -18, rotY = -22, fontSize,
}) => {
  const fs = fontSize ?? Math.min(h * 0.55, w / Math.max(1, (label?.length ?? 1) * 0.6));
  const lbl = label ? <span style={{fontFamily: F.display, fontSize: fs, color: labelColor, lineHeight: 1, paddingTop: fs * 0.12}}>{label}</span> : null;
  const center: React.CSSProperties = {display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10};
  return (
    <div style={{width: w, height: h, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`}}>
      <div style={face(w, h, `translateZ(${d / 2}px)`, {...center, background: `linear-gradient(180deg, ${mix(color, '#ffffff', 0.18)}, ${color})`,
        boxShadow: 'inset 0 4px 0 rgba(255,255,255,0.45), inset 0 -6px 0 rgba(0,0,0,0.12)'})}>{lbl}</div>
      <div style={face(w, h, `rotateY(180deg) translateZ(${d / 2}px)`, {background: mix(color, '#000000', 0.4)})} />
      <div style={face(d, h, `rotateY(90deg) translateZ(${w / 2}px)`, {background: mix(color, '#000000', 0.28), borderRadius: 10})} />
      <div style={face(d, h, `rotateY(-90deg) translateZ(${w / 2}px)`, {background: mix(color, '#000000', 0.18), borderRadius: 10})} />
      <div style={face(w, d, `rotateX(90deg) translateZ(${h / 2}px)`, {background: mix(color, '#ffffff', 0.32), borderRadius: 10})} />
      <div style={face(w, d, `rotateX(-90deg) translateZ(${h / 2}px)`, {background: mix(color, '#000000', 0.5)})} />
    </div>
  );
};
