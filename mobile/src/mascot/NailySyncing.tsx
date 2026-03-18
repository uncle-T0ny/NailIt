import React, { useEffect } from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface Props { size?: number; }

export default function NailySyncing({ size = 120 }: Props) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 400 }),
        withTiming(-10, { duration: 400 }),
      ),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Rect x="42" y="35" width="36" height="55" rx="8" fill="#B0B8C4" />
        <Rect x="32" y="28" width="56" height="12" rx="4" fill="#9AA3B0" />
        <Path d="M48 90 L60 108 L72 90 Z" fill="#9AA3B0" />
        <Ellipse cx="60" cy="22" rx="28" ry="12" fill="#FF6B35" />
        <Rect x="36" y="16" width="48" height="10" rx="3" fill="#FF6B35" />
        <Rect x="44" y="12" width="32" height="8" rx="4" fill="#FF8C5A" />
        <Rect x="30" y="24" width="60" height="4" rx="2" fill="#E55A2B" />
        {/* Determined eyes */}
        <Circle cx="50" cy="48" r="3" fill="#1B2A4A" />
        <Circle cx="70" cy="48" r="3" fill="#1B2A4A" />
        <Path d="M50 58 Q60 64 70 58" stroke="#1B2A4A" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Running pose — arms bent */}
        <Path d="M42 50 L28 42 L22 50" stroke="#9AA3B0" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M78 50 L92 42 L98 50" stroke="#9AA3B0" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Sync arrows icon above */}
        <Path d="M52 4 L60 0 L60 8" stroke="#22C55E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M68 4 L60 8 L60 0" stroke="#22C55E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M54 4 A8 8 0 0 1 66 4" stroke="#22C55E" strokeWidth="2" fill="none" />
      </Svg>
    </Animated.View>
  );
}
