import React, { useEffect } from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  size?: number;
  animate?: boolean;
}

export default function NailyWave({ size = 120, animate = true }: Props) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (animate) {
      rotation.value = withSequence(
        withTiming(15, { duration: 200 }),
        withTiming(-15, { duration: 200 }),
        withTiming(10, { duration: 150 }),
        withTiming(-10, { duration: 150 }),
        withTiming(0, { duration: 150 }),
      );
    }
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
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
        <Circle cx="50" cy="48" r="3" fill="#1B2A4A" />
        <Circle cx="70" cy="48" r="3" fill="#1B2A4A" />
        <Path d="M50 58 Q60 66 70 58" stroke="#1B2A4A" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Left arm down */}
        <Line x1="42" y1="50" x2="25" y2="60" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
        {/* Right arm waving up */}
        <Line x1="78" y1="45" x2="100" y2="25" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
        {/* Hand */}
        <Circle cx="102" cy="23" r="4" fill="#9AA3B0" />
      </Svg>
    </Animated.View>
  );
}
