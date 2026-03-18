import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { COLORS } from '../utils/config';

interface NailItTextInputProps extends Omit<TextInputProps, 'placeholderTextColor'> {}

export function NailItTextInput(props: NailItTextInputProps) {
  const { style, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={COLORS.gray}
      {...rest}
      style={[styles.input, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.navy,
  },
});
