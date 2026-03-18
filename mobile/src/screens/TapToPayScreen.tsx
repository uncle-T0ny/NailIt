import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import type { Reader } from '@stripe/stripe-terminal-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NailyWorking, NailyTap, NailyError } from '../mascot';
import { createPaymentIntent, completeTransaction } from '../utils/api';
import { addToQueue } from '../utils/offlineQueue';
import { COLORS, STRIPE_LOCATION_ID } from '../utils/config';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TapToPay'>;
type Stage = 'connecting' | 'ready' | 'processing' | 'failed';

export default function TapToPayScreen({ navigation, route }: Props) {
  const { amount, description, category, phone } = route.params;
  const [stage, setStage] = useState<Stage>('connecting');
  const [error, setError] = useState('');

  const {
    discoverReaders,
    connectReader,
    discoveredReaders,
    createPaymentIntent: sdkCreatePaymentIntent,
    collectPaymentMethod,
    confirmPaymentIntent,
    retrievePaymentIntent,
  } = useStripeTerminal({
    onUpdateDiscoveredReaders: () => {},
  });

  useEffect(() => {
    runPaymentFlow();
  }, []);

  const runPaymentFlow = async () => {
    try {
      setStage('connecting');
      setError('');

      // Step 1: Discover readers
      const { error: discoverError } = await discoverReaders({
        discoveryMethod: 'tapToPay',
        simulated: true,
      });

      if (discoverError) throw new Error(discoverError.message);

      // Wait a moment for discoveredReaders to update
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 2: Connect to reader
      const readers = discoveredReaders;
      if (!readers || readers.length === 0) {
        throw new Error('No readers found');
      }

      const { error: connectError } = await connectReader({
        reader: readers[0],
        locationId: STRIPE_LOCATION_ID,
        autoReconnectOnUnexpectedDisconnect: false,
        discoveryMethod: 'tapToPay',
      } as any);

      if (connectError) throw new Error(connectError.message);

      // Step 3: Create PaymentIntent via backend
      let backendData: any;
      try {
        backendData = await createPaymentIntent(amount, description, category);
      } catch {
        // If backend is unreachable, use SDK-only PaymentIntent
        const { paymentIntent: sdkPI, error: piError } = await sdkCreatePaymentIntent({
          amount,
          currency: 'usd',
        });
        if (piError) throw new Error(piError.message);
        backendData = { client_secret: sdkPI?.clientSecret, id: sdkPI?.id };
      }

      setStage('ready');

      // Retrieve the full PaymentIntent object from the client_secret
      const { paymentIntent: fullPI, error: retrieveError } = await retrievePaymentIntent(
        backendData.client_secret
      );
      if (retrieveError) throw new Error(retrieveError.message);
      if (!fullPI) throw new Error('Could not retrieve PaymentIntent');

      // Step 4: Collect payment method (shows Tap to Pay UI)
      const { paymentIntent: collectedPI, error: collectError } = await collectPaymentMethod({
        paymentIntent: fullPI,
      });

      if (collectError) throw new Error(collectError.message);

      setStage('processing');

      // Step 5: Confirm payment
      const { paymentIntent: confirmedPI, error: confirmError } = await confirmPaymentIntent({
        paymentIntent: collectedPI!,
      });

      if (confirmError) throw new Error(confirmError.message);

      // Extract card details from the confirmed payment
      const charge = confirmedPI?.charges?.[0];
      const cardLast4 = charge?.paymentMethodDetails?.cardPresentDetails?.last4 || '4242';
      const cardBrand = charge?.paymentMethodDetails?.cardPresentDetails?.brand || 'visa';

      // Mark complete in backend
      try {
        await completeTransaction(backendData.id, cardLast4, cardBrand);
      } catch {
        // Offline — queue for sync
        await addToQueue({
          amount,
          description,
          category,
          stripe_payment_intent_id: backendData.id,
          card_last4: cardLast4,
          card_brand: cardBrand,
          customer_phone: phone,
          created_at: new Date().toISOString(),
        });
      }

      // Navigate to receipt
      navigation.replace('Receipt', {
        amount,
        description,
        category,
        cardLast4,
        cardBrand,
        paymentIntentId: backendData.id,
        phone,
      });
    } catch (err: any) {
      setStage('failed');
      setError(err.message || 'Payment failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {stage === 'connecting' && (
          <>
            <NailyWorking size={120} />
            <Text style={styles.statusText}>Connecting...</Text>
            <ActivityIndicator color={COLORS.orange} size="large" style={{ marginTop: 16 }} />
          </>
        )}

        {stage === 'ready' && (
          <>
            <NailyTap size={120} />
            <Text style={styles.statusText}>Ready — Tap or Insert Card</Text>
            <Text style={styles.amountText}>${(amount / 100).toFixed(2)}</Text>
          </>
        )}

        {stage === 'processing' && (
          <>
            <NailyWorking size={120} />
            <Text style={styles.statusText}>Processing...</Text>
            <ActivityIndicator color={COLORS.orange} size="large" style={{ marginTop: 16 }} />
          </>
        )}

        {stage === 'failed' && (
          <>
            <NailyError size={120} />
            <Text style={styles.statusText}>Payment Failed</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={runPaymentFlow}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  statusText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 20,
    textAlign: 'center',
  },
  amountText: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.orange,
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.red,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginTop: 24,
  },
  retryText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  cancelButton: { marginTop: 16 },
  cancelText: { color: COLORS.gray, fontSize: 16 },
});
