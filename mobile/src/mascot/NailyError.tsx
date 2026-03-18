import React from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

interface Props { size?: number; }

export default function NailyError({ size = 120 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Rect x="42" y="35" width="36" height="55" rx="8" fill="#B0B8C4" />
      <Rect x="32" y="28" width="56" height="12" rx="4" fill="#9AA3B0" />
      <Path d="M48 90 L60 108 L72 90 Z" fill="#9AA3B0" />
      {/* Tilted hard hat */}
      <G transform="rotate(-15, 60, 22)">
        <Ellipse cx="60" cy="22" rx="28" ry="12" fill="#FF6B35" />
        <Rect x="36" y="16" width="48" height="10" rx="3" fill="#FF6B35" />
        <Rect x="44" y="12" width="32" height="8" rx="4" fill="#FF8C5A" />
        <Rect x="30" y="24" width="60" height="4" rx="2" fill="#E55A2B" />
      </G>
      {/* Worried eyes — big, round */}
      <Circle cx="50" cy="48" r="4" fill="#1B2A4A" />
      <Circle cx="70" cy="48" r="4" fill="#1B2A4A" />
      {/* Eyebrows up */}
      <Line x1="44" y1="40" x2="54" y2="38" stroke="#1B2A4A" strokeWidth="2" strokeLinecap="round" />
      <Line x1="76" y1="40" x2="66" y2="38" stroke="#1B2A4A" strokeWidth="2" strokeLinecap="round" />
      {/* Worried mouth — O shape */}
      <Ellipse cx="60" cy="62" rx="5" ry="4" stroke="#1B2A4A" strokeWidth="2" fill="none" />
      {/* One hand on head */}
      <Path d="M78 45 L95 30 L88 22" stroke="#9AA3B0" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="87" cy="20" r="4" fill="#9AA3B0" />
      {/* Other arm hanging */}
      <Line x1="42" y1="50" x2="25" y2="65" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}
