import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

interface Props { size?: number; }

export default function NailyShrug({ size = 120 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Rect x="42" y="35" width="36" height="55" rx="8" fill="#B0B8C4" />
      <Rect x="32" y="28" width="56" height="12" rx="4" fill="#9AA3B0" />
      <Path d="M48 90 L60 108 L72 90 Z" fill="#9AA3B0" />
      <Ellipse cx="60" cy="22" rx="28" ry="12" fill="#FF6B35" />
      <Rect x="36" y="16" width="48" height="10" rx="3" fill="#FF6B35" />
      <Rect x="44" y="12" width="32" height="8" rx="4" fill="#FF8C5A" />
      <Rect x="30" y="24" width="60" height="4" rx="2" fill="#E55A2B" />
      {/* Raised eyebrow eyes */}
      <Circle cx="50" cy="48" r="3" fill="#1B2A4A" />
      <Circle cx="70" cy="46" r="3" fill="#1B2A4A" />
      {/* Flat mouth */}
      <Line x1="52" y1="60" x2="68" y2="60" stroke="#1B2A4A" strokeWidth="2" strokeLinecap="round" />
      {/* Arms out, palms up */}
      <Path d="M42 48 L18 38 L14 32" stroke="#9AA3B0" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M78 48 L102 38 L106 32" stroke="#9AA3B0" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Open palms */}
      <Circle cx="13" cy="30" r="4" fill="#9AA3B0" />
      <Circle cx="107" cy="30" r="4" fill="#9AA3B0" />
    </Svg>
  );
}
