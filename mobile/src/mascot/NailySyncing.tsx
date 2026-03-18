import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import SyncingSvg from '../../assets/mascot/naily-syncing.svg';

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
      <SyncingSvg width={size} height={size} />
    </Animated.View>
  );
}
