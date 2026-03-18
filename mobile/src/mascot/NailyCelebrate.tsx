import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withRepeat,
} from 'react-native-reanimated';
import CelebrateSvg from '../../assets/mascot/naily-celebrate.svg';

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
        <CelebrateSvg width={size} height={size} />
      </Animated.View>
    </View>
  );
}
