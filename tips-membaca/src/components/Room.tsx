import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {Layer} from './Camera';
import {useT} from '../lib/time';

const SHELF_BOOKS = ['#FFD23F', '#E5484D', '#2F62D8', '#FFFFFF', '#FF8A1F', '#14327A', '#8FB6FF', '#FFD23F', '#26B36B'];

/** 2.5D study room built from parallax layers: wall, window, shelf, poster, wall clock. */
export const StudyRoom: React.FC<{mood?: 'normal' | 'dim'}> = ({mood = 'normal'}) => {
  const {t} = useT();
  const dim = mood === 'dim';
  return (
    <>
      <Layer depth={0.15}>
        <AbsoluteFill style={{background: dim ? 'linear-gradient(180deg, #23345E, #101C3D)' : 'linear-gradient(180deg, #3563C9 0%, #1D3F96 60%, #14307A 100%)'}} />
        <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 120px)'}} />
        {/* window */}
        <div style={{position: 'absolute', left: 70, top: 260, width: 360, height: 420, borderRadius: 26, background: dim ? '#1A2B55' : 'linear-gradient(180deg, #BFE0FF, #7FB6F5)',
          border: '18px solid #F2F5FC', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 40 + Math.sin(t * 0.3) * 20, top: 70, width: 150, height: 54, borderRadius: 40, background: dim ? '#2A3B66' : '#FFFFFF', opacity: 0.9}} />
          <div style={{position: 'absolute', left: 170 + Math.sin(t * 0.25) * 16, top: 170, width: 110, height: 40, borderRadius: 30, background: dim ? '#2A3B66' : '#FFFFFF', opacity: 0.8}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 14, background: '#F2F5FC'}} />
          <div style={{position: 'absolute', top: 0, bottom: 0, left: '50%', width: 14, background: '#F2F5FC'}} />
        </div>
        <div style={{position: 'absolute', left: 40, top: 230, width: 120, height: 500, borderRadius: '0 0 40px 40px', background: 'linear-gradient(90deg, #E8A300, #FFD23F)', opacity: dim ? 0.5 : 1}} />
        <div style={{position: 'absolute', left: 340, top: 230, width: 120, height: 500, borderRadius: '0 0 40px 40px', background: 'linear-gradient(90deg, #FFD23F, #E8A300)', opacity: dim ? 0.5 : 1}} />
      </Layer>
      <Layer depth={0.35}>
        {/* shelf */}
        {[420, 640].map((y, k) => (
          <div key={y} style={{position: 'absolute', left: 640, top: y}}>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 6, height: 150, paddingLeft: 20}}>
              {SHELF_BOOKS.slice(k * 3, k * 3 + 6).map((c, i) => (
                <div key={i} style={{width: 44, height: 110 + ((i * 37) % 40), background: c, borderRadius: 6, boxShadow: 'inset -6px 0 0 rgba(0,0,0,0.18)',
                  transform: i === 4 ? 'rotate(12deg) translateX(10px)' : undefined, filter: dim ? 'brightness(0.55)' : undefined}} />
              ))}
            </div>
            <div style={{width: 400, height: 22, borderRadius: 6, background: dim ? '#5B4632' : '#C98B54', boxShadow: '0 10px 18px rgba(0,0,0,0.3)'}} />
          </div>
        ))}
      </Layer>
    </>
  );
};

/** Desk in front of the character (covers the lower body). */
export const Desk: React.FC<{y?: number; dim?: boolean}> = ({y = 1110, dim}) => (
  <div style={{position: 'absolute', left: -60, right: -60, top: y, height: 1920 - y}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 70, background: dim ? 'linear-gradient(180deg, #8C6A4D, #6E523B)' : 'linear-gradient(180deg, #E7B47F, #C98B54)',
      clipPath: 'polygon(6% 0, 94% 0, 100% 100%, 0 100%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 70, bottom: 0, background: dim ? 'linear-gradient(180deg, #5C4431, #2E2219)' : 'linear-gradient(180deg, #B97A45, #7A4B26)',
      boxShadow: 'inset 0 10px 18px rgba(0,0,0,0.25)'}} />
  </div>
);
