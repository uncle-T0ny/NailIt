import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../utils/config';

interface BannerProps {
  variant?: 'warning' | 'info';
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export function Banner({ variant = 'warning', icon, children, action, style }: BannerProps) {
  return (
    <View style={[styles.banner, variantStyles[variant], style]}>
      {icon}
      <View style={styles.content}>
        {typeof children === 'string' ? (
          <Text style={styles.text}>{children}</Text>
        ) : (
          children
        )}
      </View>
      {action && (
        <TouchableOpacity style={styles.actionBtn} onPress={action.onPress}>
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  actionBtn: {
    backgroundColor: COLORS.orange,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
});

const variantStyles = StyleSheet.create({
  warning: {
    backgroundColor: '#FEF3C7',
  },
  info: {
    backgroundColor: '#DBEAFE',
  },
});
