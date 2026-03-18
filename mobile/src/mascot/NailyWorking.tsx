import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import WorkingSvg from '../../assets/mascot/naily-working.svg';

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
      <WorkingSvg width={size} height={size} />
    </Animated.View>
  );
}
