import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NailyCelebrate, NailyThumbsUp } from '../mascot';
import { sendReceipt } from '../utils/api';
import { COLORS, CATEGORIES } from '../utils/config';
import { Button, Badge, NailItTextInput } from '../components';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Receipt'>;

export default function ReceiptScreen({ navigation, route }: Props) {
  const { amount, description, category, cardLast4, cardBrand, paymentIntentId, phone } =
    route.params;
  const [receiptState, setReceiptState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [phoneInput, setPhoneInput] = useState(phone || '');
  const [showPhoneInput] = useState(!phone);

  const categoryLabel = CATEGORIES.find((c) => c.key === category)?.label || category;
  const amountDisplay = `$${(amount / 100).toFixed(2)}`;
  const cardDisplay = `${cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1)} •••• ${cardLast4}`;

  const handleSendReceipt = async () => {
    if (!phoneInput.trim()) return;
    setReceiptState('sending');
    try {
      await sendReceipt(paymentIntentId, phoneInput.trim());
      setReceiptState('sent');
    } catch {
      setReceiptState('error');
    }
  };

  const isSent = receiptState === 'sent';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {isSent ? <NailyThumbsUp size={120} /> : <NailyCelebrate size={120} />}

        <Text style={styles.successText}>
          {isSent ? 'Receipt Sent!' : 'Payment Successful'}
        </Text>

        <Text style={styles.amount}>{amountDisplay}</Text>
        <Text style={styles.cardInfo}>{cardDisplay}</Text>

        <Badge variant="category" label={categoryLabel} style={styles.categoryBadge} />

        {description ? <Text style={styles.description}>{description}</Text> : null}

        <Text style={styles.timestamp}>
          {new Date().toLocaleString()}
        </Text>

        {/* SMS Receipt */}
        {receiptState !== 'sent' && (
          <View style={styles.receiptSection}>
            {showPhoneInput && (
              <NailItTextInput
                placeholder="Phone number (e.g., +15551234567)"
                value={phoneInput}
                onChangeText={setPhoneInput}
                keyboardType="phone-pad"
                style={styles.phoneInput}
              />
            )}
            <Button
              variant="success"
              onPress={handleSendReceipt}
              disabled={!phoneInput.trim()}
              loading={receiptState === 'sending'}
            >
              {receiptState === 'error' ? 'Retry Send Receipt' : 'Send Receipt'}
            </Button>
            {receiptState === 'error' && (
              <Text style={styles.errorText}>Failed to send. Try again.</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.buttons}>
        <Button
          variant="secondary"
          onPress={() => navigation.popToTop()}
          style={styles.buttonFlex}
        >
          Done
        </Button>
        <Button
          variant="primary"
          onPress={() => navigation.replace('CollectPayment')}
          style={styles.buttonFlex}
        >
          New Payment
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.green,
    marginTop: 16,
  },
  amount: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.navy,
    marginTop: 8,
  },
  cardInfo: {
    fontSize: 18,
    color: COLORS.darkGray,
    marginTop: 8,
  },
  categoryBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 12,
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 8,
  },
  receiptSection: { marginTop: 24, alignItems: 'center', width: '100%' },
  phoneInput: {
    width: '100%',
    marginBottom: 12,
    textAlign: 'center',
    padding: 14,
  },
  errorText: { color: COLORS.red, fontSize: 13, marginTop: 8 },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  buttonFlex: {
    flex: 1,
  },
});
