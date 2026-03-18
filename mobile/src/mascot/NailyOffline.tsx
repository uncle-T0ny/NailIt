import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

interface Props { size?: number; }

export default function NailyOffline({ size = 120 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Rect x="42" y="35" width="36" height="55" rx="8" fill="#B0B8C4" />
      <Rect x="32" y="28" width="56" height="12" rx="4" fill="#9AA3B0" />
      <Path d="M48 90 L60 108 L72 90 Z" fill="#9AA3B0" />
      <Ellipse cx="60" cy="22" rx="28" ry="12" fill="#FF6B35" />
      <Rect x="36" y="16" width="48" height="10" rx="3" fill="#FF6B35" />
      <Rect x="44" y="12" width="32" height="8" rx="4" fill="#FF8C5A" />
      <Rect x="30" y="24" width="60" height="4" rx="2" fill="#E55A2B" />
      {/* Slight frown */}
      <Circle cx="50" cy="48" r="3" fill="#1B2A4A" />
      <Circle cx="70" cy="48" r="3" fill="#1B2A4A" />
      <Path d="M52 62 Q60 56 68 62" stroke="#1B2A4A" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Left arm holding wifi icon */}
      <Line x1="42" y1="50" x2="16" y2="42" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
      {/* Broken WiFi icon */}
      <Path d="M4 35 Q11 28 18 35" stroke="#EF4444" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Path d="M7 39 Q11 34 15 39" stroke="#EF4444" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Circle cx="11" cy="42" r="2" fill="#EF4444" />
      {/* X through wifi */}
      <Line x1="4" y1="30" x2="18" y2="44" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
      {/* Right arm down */}
      <Line x1="78" y1="50" x2="95" y2="60" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}
