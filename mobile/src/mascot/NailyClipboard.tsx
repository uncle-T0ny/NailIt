import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

interface Props { size?: number; }

export default function NailyClipboard({ size = 120 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Rect x="42" y="35" width="36" height="55" rx="8" fill="#B0B8C4" />
      <Rect x="32" y="28" width="56" height="12" rx="4" fill="#9AA3B0" />
      <Path d="M48 90 L60 108 L72 90 Z" fill="#9AA3B0" />
      <Ellipse cx="60" cy="22" rx="28" ry="12" fill="#FF6B35" />
      <Rect x="36" y="16" width="48" height="10" rx="3" fill="#FF6B35" />
      <Rect x="44" y="12" width="32" height="8" rx="4" fill="#FF8C5A" />
      <Rect x="30" y="24" width="60" height="4" rx="2" fill="#E55A2B" />
      {/* Eyes with reading glasses */}
      <Circle cx="48" cy="48" r="6" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
      <Circle cx="72" cy="48" r="6" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
      <Line x1="54" y1="48" x2="66" y2="48" stroke="#1B2A4A" strokeWidth="1" />
      <Circle cx="48" cy="48" r="2.5" fill="#1B2A4A" />
      <Circle cx="72" cy="48" r="2.5" fill="#1B2A4A" />
      {/* Slight smile */}
      <Path d="M52 58 Q60 63 68 58" stroke="#1B2A4A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Left arm holding clipboard */}
      <Line x1="42" y1="50" x2="14" y2="50" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
      {/* Clipboard */}
      <Rect x="2" y="42" width="18" height="24" rx="2" fill="#D4A574" />
      <Rect x="6" y="39" width="10" height="5" rx="2" fill="#8B6914" />
      <Line x1="6" y1="50" x2="16" y2="50" stroke="#1B2A4A" strokeWidth="1" />
      <Line x1="6" y1="54" x2="16" y2="54" stroke="#1B2A4A" strokeWidth="1" />
      <Line x1="6" y1="58" x2="14" y2="58" stroke="#1B2A4A" strokeWidth="1" />
      {/* Right arm down */}
      <Line x1="78" y1="50" x2="95" y2="60" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}
