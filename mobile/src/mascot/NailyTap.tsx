import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

interface Props { size?: number; }

export default function NailyTap({ size = 120 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Rect x="42" y="30" width="36" height="50" rx="8" fill="#B0B8C4" />
      <Rect x="32" y="23" width="56" height="12" rx="4" fill="#9AA3B0" />
      <Path d="M48 80 L60 98 L72 80 Z" fill="#9AA3B0" />
      <Ellipse cx="60" cy="17" rx="28" ry="12" fill="#FF6B35" />
      <Rect x="36" y="11" width="48" height="10" rx="3" fill="#FF6B35" />
      <Rect x="44" y="7" width="32" height="8" rx="4" fill="#FF8C5A" />
      <Rect x="30" y="19" width="60" height="4" rx="2" fill="#E55A2B" />
      <Circle cx="50" cy="43" r="3" fill="#1B2A4A" />
      <Circle cx="70" cy="43" r="3" fill="#1B2A4A" />
      <Path d="M50 53 Q60 60 70 53" stroke="#1B2A4A" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Left arm out */}
      <Line x1="42" y1="45" x2="25" y2="55" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
      {/* Right arm pointing down at phone */}
      <Line x1="78" y1="50" x2="90" y2="75" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
      <Circle cx="91" cy="77" r="3" fill="#9AA3B0" />
      {/* Phone icon */}
      <Rect x="82" y="82" width="18" height="30" rx="3" stroke="#1B2A4A" strokeWidth="1.5" fill="#E5E7EB" />
      <Circle cx="91" cy="108" r="1.5" fill="#1B2A4A" />
    </Svg>
  );
}
