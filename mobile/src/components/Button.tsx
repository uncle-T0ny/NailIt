import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../utils/config';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'small' | 'text';

interface ButtonProps {
  variant?: ButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  children,
  style,
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  const textStyle = textStyles[variant];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyle,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : typeof children === 'string' ? (
        <Text style={textStyle}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.orange,
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondary: {
    backgroundColor: COLORS.navy,
    borderRadius: 14,
    paddingVertical: 18,
  },
  success: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  small: {
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  text: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
});

const textStyles = StyleSheet.create({
  primary: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  secondary: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  success: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  small: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  text: { color: COLORS.gray, fontSize: 16 },
});
