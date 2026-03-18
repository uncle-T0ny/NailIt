import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

interface Props { size?: number; }

export default function NailyThumbsUp({ size = 120 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Rect x="42" y="35" width="36" height="55" rx="8" fill="#B0B8C4" />
      <Rect x="32" y="28" width="56" height="12" rx="4" fill="#9AA3B0" />
      <Path d="M48 90 L60 108 L72 90 Z" fill="#9AA3B0" />
      <Ellipse cx="60" cy="22" rx="28" ry="12" fill="#FF6B35" />
      <Rect x="36" y="16" width="48" height="10" rx="3" fill="#FF6B35" />
      <Rect x="44" y="12" width="32" height="8" rx="4" fill="#FF8C5A" />
      <Rect x="30" y="24" width="60" height="4" rx="2" fill="#E55A2B" />
      {/* Wink — left eye closed, right open */}
      <Line x1="46" y1="48" x2="54" y2="48" stroke="#1B2A4A" strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="70" cy="48" r="3" fill="#1B2A4A" />
      {/* Smile */}
      <Path d="M50 58 Q60 66 70 58" stroke="#1B2A4A" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Left arm down */}
      <Line x1="42" y1="50" x2="25" y2="60" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
      {/* Right arm with thumbs up */}
      <Line x1="78" y1="45" x2="98" y2="30" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
      {/* Thumb */}
      <Rect x="94" y="18" width="8" height="14" rx="4" fill="#9AA3B0" />
      {/* Fist */}
      <Rect x="92" y="28" width="12" height="8" rx="3" fill="#9AA3B0" />
    </Svg>
  );
}
