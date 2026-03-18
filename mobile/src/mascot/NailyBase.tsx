import React from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

interface NailyBaseProps {
  size?: number;
  armLeft?: React.ReactNode;
  armRight?: React.ReactNode;
  face?: React.ReactNode;
  extras?: React.ReactNode;
  hatTilt?: number;
}

// Shared base: nail body + hard hat + default face
export default function NailyBase({
  size = 120,
  armLeft,
  armRight,
  face,
  extras,
  hatTilt = 0,
}: NailyBaseProps) {
  const scale = size / 120;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <G transform={`scale(${1})`}>
        {/* Nail body — rounded rectangle, metallic gray */}
        <Rect x="42" y="35" width="36" height="55" rx="8" fill="#B0B8C4" />
        {/* Nail head — flat top */}
        <Rect x="32" y="28" width="56" height="12" rx="4" fill="#9AA3B0" />
        {/* Nail point — triangle at bottom */}
        <Path d="M48 90 L60 108 L72 90 Z" fill="#9AA3B0" />

        {/* Hard hat */}
        <G transform={`rotate(${hatTilt}, 60, 22)`}>
          <Ellipse cx="60" cy="22" rx="28" ry="12" fill="#FF6B35" />
          <Rect x="36" y="16" width="48" height="10" rx="3" fill="#FF6B35" />
          <Rect x="44" y="12" width="32" height="8" rx="4" fill="#FF8C5A" />
          {/* Hat brim */}
          <Rect x="30" y="24" width="60" height="4" rx="2" fill="#E55A2B" />
        </G>

        {/* Default face — dot eyes + smile */}
        {face || (
          <>
            <Circle cx="50" cy="48" r="3" fill="#1B2A4A" />
            <Circle cx="70" cy="48" r="3" fill="#1B2A4A" />
            <Path d="M50 58 Q60 66 70 58" stroke="#1B2A4A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* Arms */}
        {armLeft || (
          <Line x1="42" y1="50" x2="25" y2="60" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
        )}
        {armRight || (
          <Line x1="78" y1="50" x2="95" y2="60" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
        )}

        {/* Extras (confetti, icons, etc.) */}
        {extras}
      </G>
    </Svg>
  );
}
