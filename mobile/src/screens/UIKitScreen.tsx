import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Button, Card, Chip, NailItTextInput, Badge, ScreenHeader, NumericKeypad, Banner } from '../components';
import {
  NailyWave,
  NailyReady,
  NailyTap,
  NailyWorking,
  NailyCelebrate,
  NailyThumbsUp,
  NailyClipboard,
  NailyShrug,
  NailyOffline,
  NailySyncing,
  NailyError,
} from '../mascot';
import { COLORS } from '../utils/config';

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function DemoRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.demoRow}>{children}</View>;
}

export default function UIKitScreen() {
  const [activeChipOrange, setActiveChipOrange] = useState('Framing');
  const [activeChipNavy, setActiveChipNavy] = useState('labor');
  const [amountStr, setAmountStr] = useState('0');
  const [inputValue, setInputValue] = useState('');

  const handleKeyPress = useCallback((key: string) => {
    setAmountStr((prev) => {
      if (key === '⌫') return prev.length > 1 ? prev.slice(0, -1) : '0';
      if (key === '.' && prev.includes('.')) return prev;
      if (prev === '0' && key !== '.') return key;
      const parts = (prev + key).split('.');
      if (parts[1] && parts[1].length > 2) return prev;
      return prev + key;
    });
  }, []);

  const amountDisplay = `$${parseFloat(amountStr || '0').toFixed(2)}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="UI Kit" mascot={<NailyClipboard size={60} />} />

        {/* ── Buttons ── */}
        <SectionLabel>Buttons</SectionLabel>
        <Card style={styles.section}>
          <Text style={styles.label}>Primary</Text>
          <Button variant="primary" onPress={() => {}}>Collect Payment</Button>
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Secondary</Text>
          <Button variant="secondary" onPress={() => {}}>Done</Button>
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Success</Text>
          <Button variant="success" onPress={() => {}}>Send Receipt</Button>
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Small</Text>
          <DemoRow>
            <Button variant="small" onPress={() => {}}>CSV</Button>
            <Button variant="small" onPress={() => {}}>Export</Button>
          </DemoRow>
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Text</Text>
          <Button variant="text" onPress={() => {}}>Cancel</Button>
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Disabled</Text>
          <Button variant="primary" onPress={() => {}} disabled>Disabled</Button>
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Loading</Text>
          <Button variant="primary" onPress={() => {}} loading>Loading</Button>
        </Card>

        {/* ── Cards ── */}
        <SectionLabel>Cards</SectionLabel>
        <Card style={styles.section}>
          <Text style={styles.label}>Default Card</Text>
          <Card centered>
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.darkGray }}>Demo Construction Co.</Text>
            <Text style={{ fontSize: 13, color: COLORS.gray, marginTop: 4 }}>Tap to Pay Terminal</Text>
          </Card>
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Transaction Card</Text>
          <Card variant="transaction">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.navy }}>$150.00</Text>
              <Badge variant="category" label="Labor" color="#3B82F6" />
            </View>
            <Text style={{ fontSize: 14, color: COLORS.darkGray, marginTop: 6 }}>Framing - 45 Elm St</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontSize: 13, color: COLORS.gray }}>Visa •••• 4242</Text>
              <Text style={{ fontSize: 13, color: COLORS.gray }}>2:30 PM</Text>
            </View>
          </Card>
        </Card>

        {/* ── Chips ── */}
        <SectionLabel>Chips</SectionLabel>
        <Card style={styles.section}>
          <Text style={styles.label}>Orange Active</Text>
          <DemoRow>
            {['Framing', 'Drywall', 'Plumbing'].map((t) => (
              <Chip
                key={t}
                label={t}
                active={activeChipOrange === t}
                onPress={() => setActiveChipOrange(t)}
                activeColor="orange"
              />
            ))}
          </DemoRow>
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Navy Active</Text>
          <DemoRow>
            {['labor', 'materials', 'equipment'].map((t) => (
              <Chip
                key={t}
                label={t.charAt(0).toUpperCase() + t.slice(1)}
                active={activeChipNavy === t}
                onPress={() => setActiveChipNavy(t)}
                activeColor="navy"
              />
            ))}
          </DemoRow>
        </Card>

        {/* ── Text Inputs ── */}
        <SectionLabel>Text Inputs</SectionLabel>
        <Card style={styles.section}>
          <Text style={styles.label}>Default</Text>
          <NailItTextInput
            placeholder="e.g., Framing - 45 Elm St"
            value={inputValue}
            onChangeText={setInputValue}
          />
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Phone</Text>
          <NailItTextInput
            placeholder="Customer phone (optional)"
            keyboardType="phone-pad"
          />
        </Card>

        {/* ── Badges ── */}
        <SectionLabel>Badges</SectionLabel>
        <Card style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <DemoRow>
            <Badge variant="category" label="Labor" color="#3B82F6" />
            <Badge variant="category" label="Materials" color="#F59E0B" />
            <Badge variant="category" label="Subcontractor" color="#8B5CF6" />
            <Badge variant="category" label="Equipment" color="#10B981" />
            <Badge variant="category" label="Other" color="#6B7280" />
          </DemoRow>
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Status</Text>
          <DemoRow>
            <Badge variant="status" label="Completed" />
            <Badge variant="status" label="Pending" />
          </DemoRow>
        </Card>

        {/* ── Numeric Keypad ── */}
        <SectionLabel>Numeric Keypad</SectionLabel>
        <Card style={styles.section}>
          <Text style={styles.amountDisplay}>{amountDisplay}</Text>
          <NumericKeypad onKeyPress={handleKeyPress} />
        </Card>

        {/* ── Banners ── */}
        <SectionLabel>Banners</SectionLabel>
        <Card style={styles.section}>
          <Text style={styles.label}>Warning with Action</Text>
          <Banner
            variant="warning"
            icon={<NailyOffline size={40} />}
            action={{ label: 'Sync Now', onPress: () => {} }}
          >
            2 payments pending sync
          </Banner>
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Info</Text>
          <Banner variant="info" icon={<NailySyncing size={40} />}>
            Syncing transactions...
          </Banner>
        </Card>

        {/* ── Screen Headers ── */}
        <SectionLabel>Screen Headers</SectionLabel>
        <Card style={styles.section}>
          <Text style={styles.label}>Centered</Text>
          <ScreenHeader title="NailIt" mascot={<NailyWave size={56} />} centered />
          <View style={{ height: 12 }} />
          <Text style={styles.label}>With Right Action</Text>
          <ScreenHeader
            title="History"
            mascot={<NailyClipboard size={60} />}
            rightAction={<Button variant="small" onPress={() => {}}>CSV</Button>}
          />
        </Card>

        {/* ── Mascots ── */}
        <SectionLabel>Mascots</SectionLabel>
        <Card style={styles.section}>
          <View style={styles.mascotGrid}>
            {[
              { component: <NailyWave size={56} />, name: 'Wave' },
              { component: <NailyReady size={56} />, name: 'Ready' },
              { component: <NailyTap size={56} />, name: 'Tap' },
              { component: <NailyWorking size={56} />, name: 'Working' },
              { component: <NailyCelebrate size={56} />, name: 'Celebrate' },
              { component: <NailyThumbsUp size={56} />, name: 'Thumbs Up' },
              { component: <NailyClipboard size={56} />, name: 'Clipboard' },
              { component: <NailyShrug size={56} />, name: 'Shrug' },
              { component: <NailyOffline size={56} />, name: 'Offline' },
              { component: <NailySyncing size={56} />, name: 'Syncing' },
              { component: <NailyError size={56} />, name: 'Error' },
            ].map(({ component, name }) => (
              <View key={name} style={styles.mascotItem}>
                {component}
                <Text style={styles.mascotName}>{name}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  section: {
    marginHorizontal: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  amountDisplay: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.navy,
    textAlign: 'center',
    marginBottom: 12,
  },
  mascotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  mascotItem: {
    alignItems: 'center',
    width: 80,
  },
  mascotName: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
  },
});
