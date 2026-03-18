import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../utils/config';

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  activeColor?: 'orange' | 'navy';
  style?: ViewStyle;
}

export function Chip({ label, active, onPress, activeColor = 'orange', style }: ChipProps) {
  const activeBg = activeColor === 'orange' ? COLORS.orange : COLORS.navy;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        active && { backgroundColor: activeBg, borderColor: activeBg },
        style,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, active && styles.textActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  textActive: {
    color: COLORS.white,
  },
});
