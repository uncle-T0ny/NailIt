import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NailyWorking, NailyTap, NailyError } from '../mascot';
import { createPaymentIntent, completeTransaction } from '../utils/api';
import { addToQueue } from '../utils/offlineQueue';
import { COLORS, STRIPE_LOCATION_ID, DEMO_MODE } from '../utils/config';
import { Button } from '../components';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TapToPay'>;
type Stage = 'connecting' | 'ready' | 'processing' | 'failed';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── DEMO MODE ──────────────────────────────────────────────────────
function DemoTapToPayScreen({ navigation, route }: Props) {
  const { amount, description, category, phone } = route.params;
  const [stage, setStage] = useState<Stage>('connecting');
  const [error, setError] = useState('');

  useEffect(() => {
    runDemoPaymentFlow();
  }, []);

  const runDemoPaymentFlow = async () => {
    try {
      setStage('connecting');
      setError('');

      await delay(1500);

      // Create REAL PaymentIntent via Django backend
      const backendData = await createPaymentIntent(amount, description, category);

      setStage('ready');
      await delay(2000);

      setStage('processing');
      await delay(1500);

      const cardLast4 = '4242';
      const cardBrand = 'visa';

      // Mark complete in REAL backend
      try {
        await completeTransaction(backendData.id, cardLast4, cardBrand);
      } catch {
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
            <Button variant="primary" onPress={runDemoPaymentFlow} style={styles.retryButton}>
              Try Again
            </Button>
            <Button variant="text" onPress={() => navigation.goBack()} style={styles.cancelButton}>
              Cancel
            </Button>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── REAL MODE (Stripe Terminal) ────────────────────────────────────
function RealTapToPayScreen({ navigation, route }: Props) {
  // Lazy import to avoid crashing when StripeTerminalProvider is absent
  const { useStripeTerminal } = require('@stripe/stripe-terminal-react-native');

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

      const { error: discoverError } = await discoverReaders({
        discoveryMethod: 'tapToPay',
        simulated: true,
      });
      if (discoverError) throw new Error(discoverError.message);

      await delay(500);

      const readers = discoveredReaders;
      if (!readers || readers.length === 0) throw new Error('No readers found');

      const { error: connectError } = await connectReader({
        reader: readers[0],
        locationId: STRIPE_LOCATION_ID,
        autoReconnectOnUnexpectedDisconnect: false,
        discoveryMethod: 'tapToPay',
      } as any);
      if (connectError) throw new Error(connectError.message);

      let backendData: any;
      try {
        backendData = await createPaymentIntent(amount, description, category);
      } catch {
        const { paymentIntent: sdkPI, error: piError } = await sdkCreatePaymentIntent({
          amount,
          currency: 'usd',
        });
        if (piError) throw new Error(piError.message);
        backendData = { client_secret: sdkPI?.clientSecret, id: sdkPI?.id };
      }

      setStage('ready');

      const { paymentIntent: fullPI, error: retrieveError } = await retrievePaymentIntent(
        backendData.client_secret
      );
      if (retrieveError) throw new Error(retrieveError.message);
      if (!fullPI) throw new Error('Could not retrieve PaymentIntent');

      const { paymentIntent: collectedPI, error: collectError } = await collectPaymentMethod({
        paymentIntent: fullPI,
      });
      if (collectError) throw new Error(collectError.message);

      setStage('processing');

      const { paymentIntent: confirmedPI, error: confirmError } = await confirmPaymentIntent({
        paymentIntent: collectedPI!,
      });
      if (confirmError) throw new Error(confirmError.message);

      const charge = confirmedPI?.charges?.[0];
      const cardLast4 = charge?.paymentMethodDetails?.cardPresentDetails?.last4 || '4242';
      const cardBrand = charge?.paymentMethodDetails?.cardPresentDetails?.brand || 'visa';

      try {
        await completeTransaction(backendData.id, cardLast4, cardBrand);
      } catch {
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
            <Button variant="primary" onPress={runPaymentFlow} style={styles.retryButton}>
              Try Again
            </Button>
            <Button variant="text" onPress={() => navigation.goBack()} style={styles.cancelButton}>
              Cancel
            </Button>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// Pick component based on DEMO_MODE — avoids conditional hook calls
export default DEMO_MODE ? DemoTapToPayScreen : RealTapToPayScreen;

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
    marginTop: 24,
    paddingHorizontal: 48,
  },
  cancelButton: {
    marginTop: 16,
  },
});
