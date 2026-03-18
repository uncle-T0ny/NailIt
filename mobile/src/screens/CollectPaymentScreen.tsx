import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  FlatList,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NailyReady } from '../mascot';
import { fetchJobTemplates, fetchRecentDescriptions } from '../utils/api';
import { COLORS, CATEGORIES, Category } from '../utils/config';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

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
        <View style={styles.header}>
          <NailyReady size={60} />
          <Text style={styles.title}>New Payment</Text>
        </View>

        {/* Job Template Chips */}
        {templates.length > 0 && (
          <FlatList
            horizontal
            data={templates}
            keyExtractor={(t) => t.id.toString()}
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.chip,
                  description === item.name && styles.chipActive,
                ]}
                onPress={() => handleTemplatePress(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    description === item.name && styles.chipTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Recent Jobs */}
        {recentDescs.length > 0 && (
          <View style={styles.recentRow}>
            <Text style={styles.recentLabel}>Recent:</Text>
            {recentDescs.map((desc, i) => (
              <TouchableOpacity
                key={i}
                style={styles.recentPill}
                onPress={() => setDescription(desc)}
              >
                <Text style={styles.recentText}>{desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Amount Display */}
        <Text style={styles.amountDisplay}>{amountDisplay}</Text>

        {/* Numeric Keypad */}
        <View style={styles.keypad}>
          {KEYPAD.map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.keypadKey}
              onPress={() => handleKeyPress(key)}
              activeOpacity={0.6}
            >
              <Text style={styles.keypadText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <TextInput
          style={styles.input}
          placeholder="e.g., Framing - 45 Elm St"
          placeholderTextColor={COLORS.gray}
          value={description}
          onChangeText={setDescription}
        />

        {/* Category Picker */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryPill,
                category === cat.key && styles.categoryPillActive,
              ]}
              onPress={() => setCategory(cat.key as Category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat.key && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Phone */}
        <TextInput
          style={styles.input}
          placeholder="Customer phone for receipt (optional)"
          placeholderTextColor={COLORS.gray}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </ScrollView>

      {/* Charge Button */}
      <TouchableOpacity
        style={[styles.chargeButton, amountCents <= 0 && styles.chargeButtonDisabled]}
        onPress={handleCharge}
        disabled={amountCents <= 0}
        activeOpacity={0.8}
      >
        <Text style={styles.chargeButtonText}>
          Charge {amountDisplay}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  scroll: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.navy },
  chipRow: { marginTop: 12, maxHeight: 44 },
  chip: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },
  chipText: { fontSize: 14, fontWeight: '600', color: COLORS.darkGray },
  chipTextActive: { color: COLORS.white },
  recentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  recentLabel: { fontSize: 12, color: COLORS.gray, marginRight: 4 },
  recentPill: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  recentText: { fontSize: 12, color: COLORS.darkGray },
  amountDisplay: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.navy,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  keypadKey: {
    width: '30%',
    aspectRatio: 2.2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadText: { fontSize: 24, fontWeight: '600', color: COLORS.navy },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.navy,
    marginBottom: 12,
  },
  categoryRow: { marginBottom: 12, maxHeight: 44 },
  categoryPill: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  categoryPillActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  categoryText: { fontSize: 14, fontWeight: '600', color: COLORS.darkGray },
  categoryTextActive: { color: COLORS.white },
  chargeButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 16,
    paddingVertical: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  chargeButtonDisabled: { opacity: 0.4 },
  chargeButtonText: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
});
