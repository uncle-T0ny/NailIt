import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../utils/config';

interface CardProps {
  variant?: 'default' | 'transaction';
  children: React.ReactNode;
  centered?: boolean;
  style?: ViewStyle;
}

export function Card({ variant = 'default', children, centered, style }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'transaction' ? styles.transaction : styles.default,
        centered && styles.centered,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.white,
  },
  default: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  transaction: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  centered: {
    alignItems: 'center',
  },
});
