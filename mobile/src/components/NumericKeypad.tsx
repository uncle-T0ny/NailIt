import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/config';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
}

export function NumericKeypad({ onKeyPress }: NumericKeypadProps) {
  return (
    <View style={styles.keypad}>
      {KEYS.map((key) => (
        <TouchableOpacity
          key={key}
          style={styles.key}
          onPress={() => onKeyPress(key)}
          activeOpacity={0.6}
        >
          <Text style={styles.keyText}>{key}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  key: {
    width: '30%',
    aspectRatio: 2.2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.navy,
  },
});
