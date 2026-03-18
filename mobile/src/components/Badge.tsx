import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../utils/config';

interface BadgeProps {
  variant: 'category' | 'status';
  label: string;
  color?: string;
  style?: ViewStyle;
}

export function Badge({ variant, label, color, style }: BadgeProps) {
  const bgColor =
    variant === 'status'
      ? label.toLowerCase() === 'completed'
        ? COLORS.green
        : COLORS.orange
      : color || COLORS.navy;

  return (
    <View
      style={[
        variant === 'category' ? styles.category : styles.status,
        { backgroundColor: bgColor },
        style,
      ]}
    >
      <Text style={variant === 'category' ? styles.categoryText : styles.statusText}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  category: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  status: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
});
