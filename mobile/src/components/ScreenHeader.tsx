import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../utils/config';

interface ScreenHeaderProps {
  title: string;
  mascot?: React.ReactNode;
  rightAction?: React.ReactNode;
  centered?: boolean;
  style?: ViewStyle;
}

export function ScreenHeader({ title, mascot, rightAction, centered, style }: ScreenHeaderProps) {
  return (
    <View
      style={[
        styles.header,
        centered && styles.centered,
        style,
      ]}
    >
      {mascot}
      <Text style={[styles.title, !centered && !!rightAction && styles.titleFlex]}>
        {title}
      </Text>
      {rightAction}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  centered: {
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.navy,
  },
  titleFlex: {
    flex: 1,
  },
});
