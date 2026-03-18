import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withRepeat,
} from 'react-native-reanimated';

interface Props { size?: number; }

function Confetti({ delay, x, color }: { delay: number; x: number; color: string }) {
  const translateY = useSharedValue(-10);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(withTiming(60, { duration: 1500 }), -1),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(0, { duration: 1500 }),
        ),
        -1,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: x,
    top: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color,
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={style} />;
}

export default function NailyCelebrate({ size = 120 }: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 200 }),
      withTiming(0.95, { duration: 150 }),
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 }),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const confettiColors = ['#FF6B35', '#22C55E', '#3B82F6', '#EAB308', '#EC4899'];

  return (
    <View style={{ width: size, height: size }}>
      {confettiColors.map((color, i) => (
        <Confetti key={i} delay={i * 200} x={10 + i * (size / 6)} color={color} />
      ))}
      <Animated.View style={animStyle}>
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Rect x="42" y="35" width="36" height="55" rx="8" fill="#B0B8C4" />
          <Rect x="32" y="28" width="56" height="12" rx="4" fill="#9AA3B0" />
          <Path d="M48 90 L60 108 L72 90 Z" fill="#9AA3B0" />
          <Ellipse cx="60" cy="22" rx="28" ry="12" fill="#FF6B35" />
          <Rect x="36" y="16" width="48" height="10" rx="3" fill="#FF6B35" />
          <Rect x="44" y="12" width="32" height="8" rx="4" fill="#FF8C5A" />
          <Rect x="30" y="24" width="60" height="4" rx="2" fill="#E55A2B" />
          {/* Happy eyes */}
          <Path d="M46 46 Q50 42 54 46" stroke="#1B2A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M66 46 Q70 42 74 46" stroke="#1B2A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Big smile */}
          <Path d="M46 56 Q60 70 74 56" stroke="#1B2A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Both arms up */}
          <Line x1="42" y1="45" x2="18" y2="22" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
          <Line x1="78" y1="45" x2="102" y2="22" stroke="#9AA3B0" strokeWidth="4" strokeLinecap="round" />
          {/* Hands */}
          <Circle cx="16" cy="20" r="4" fill="#9AA3B0" />
          <Circle cx="104" cy="20" r="4" fill="#9AA3B0" />
          {/* Stars */}
          <Path d="M15 10 L17 6 L19 10 L15 8 L19 8 Z" fill="#EAB308" />
          <Path d="M101 10 L103 6 L105 10 L101 8 L105 8 Z" fill="#EAB308" />
        </Svg>
      </Animated.View>
    </View>
  );
}
