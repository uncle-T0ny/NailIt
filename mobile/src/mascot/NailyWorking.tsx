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

export default function NailyWorking({ size = 120 }: Props) {
  const wobble = useSharedValue(0);

  useEffect(() => {
    wobble.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 300 }),
        withTiming(-8, { duration: 300 }),
      ),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wobble.value}deg` }],
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
        <Ellipse cx="50" cy="48" rx="3" ry="2" fill="#1B2A4A" />
        <Ellipse cx="70" cy="48" rx="3" ry="2" fill="#1B2A4A" />
        {/* Focused mouth */}
        <Line x1="52" y1="60" x2="68" y2="60" stroke="#1B2A4A" strokeWidth="2" strokeLinecap="round" />
        {/* Motion lines */}
        <Line x1="18" y1="40" x2="8" y2="40" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
        <Line x1="20" y1="50" x2="10" y2="50" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
        <Line x1="102" y1="40" x2="112" y2="40" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
        <Line x1="100" y1="50" x2="110" y2="50" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
        {/* Arms moving */}
        <Line x1="42" y1="50" x2="22" y2="42" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
        <Line x1="78" y1="50" x2="98" y2="42" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}
