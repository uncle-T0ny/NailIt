import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NailyReady } from '../mascot';
import { fetchJobTemplates, fetchRecentDescriptions } from '../utils/api';
import { COLORS, CATEGORIES, Category } from '../utils/config';
import { Button, Chip, NailItTextInput, ScreenHeader, NumericKeypad } from '../components';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function CollectPaymentScreen({ navigation }: Props) {
  const [amountStr, setAmountStr] = useState('0');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('labor');
  const [phone, setPhone] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [recentDescs, setRecentDescs] = useState<string[]>([]);

  useEffect(() => {
    fetchJobTemplates().then(setTemplates).catch(() => {});
    fetchRecentDescriptions().then(setRecentDescs).catch(() => {});
  }, []);

  const amountCents = Math.round(parseFloat(amountStr || '0') * 100);
  const amountDisplay = `$${parseFloat(amountStr || '0').toFixed(2)}`;

  const handleKeyPress = useCallback((key: string) => {
    setAmountStr((prev) => {
      if (key === '⌫') return prev.length > 1 ? prev.slice(0, -1) : '0';
      if (key === '.' && prev.includes('.')) return prev;
      if (prev === '0' && key !== '.') return key;
      // Max 2 decimal places
      const parts = (prev + key).split('.');
      if (parts[1] && parts[1].length > 2) return prev;
      return prev + key;
    });
  }, []);

  const handleTemplatePress = (template: any) => {
    setDescription(template.name);
    setCategory(template.default_category);
  };

  const handleCharge = () => {
    if (amountCents <= 0) return;
    navigation.navigate('TapToPay', {
      amount: amountCents,
      description,
      category,
      phone,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="New Payment" mascot={<NailyReady size={80} />} />

        {/* Job Template Chips */}
        {templates.length > 0 && (
          <FlatList
            horizontal
            data={templates}
            keyExtractor={(t) => t.id.toString()}
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            renderItem={({ item }) => (
              <Chip
                label={item.name}
                active={description === item.name}
                onPress={() => handleTemplatePress(item)}
                activeColor="orange"
              />
            )}
          />
        )}

        {/* Recent Jobs */}
        {recentDescs.length > 0 && (
          <View style={styles.recentRow}>
            <Text style={styles.recentLabel}>Recent:</Text>
            {recentDescs.map((desc, i) => (
              <Chip
                key={i}
                label={desc}
                active={false}
                onPress={() => setDescription(desc)}
                style={styles.recentChip}
              />
            ))}
          </View>
        )}

        {/* Amount Display */}
        <Text style={styles.amountDisplay}>{amountDisplay}</Text>

        {/* Numeric Keypad */}
        <NumericKeypad onKeyPress={handleKeyPress} />

        {/* Description */}
        <NailItTextInput
          placeholder="e.g., Framing - 45 Elm St"
          value={description}
          onChangeText={setDescription}
          style={styles.inputSpacing}
        />

        {/* Category Picker */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.key}
              label={cat.label}
              active={category === cat.key}
              onPress={() => setCategory(cat.key as Category)}
              activeColor="navy"
            />
          ))}
        </ScrollView>

        {/* Phone */}
        <NailItTextInput
          placeholder="Customer phone for receipt (optional)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.inputSpacing}
        />
      </ScrollView>

      {/* Charge Button */}
      <Button
        variant="primary"
        onPress={handleCharge}
        disabled={amountCents <= 0}
        style={styles.chargeButton}
      >
        {`Charge ${amountDisplay}`}
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  scroll: { flex: 1, paddingHorizontal: 20 },
  chipRow: { marginTop: 12, maxHeight: 44 },
  recentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  recentLabel: { fontSize: 12, color: COLORS.gray, marginRight: 4 },
  recentChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    borderWidth: 0,
  },
  amountDisplay: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.navy,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  inputSpacing: {
    marginBottom: 12,
  },
  categoryRow: { marginBottom: 12, maxHeight: 44 },
  chargeButton: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
});
