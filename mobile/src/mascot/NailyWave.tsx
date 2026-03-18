import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import WaveSvg from '../../assets/mascot/naily-wave.svg';

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
      <WaveSvg width={size} height={size} />
    </Animated.View>
  );
}
