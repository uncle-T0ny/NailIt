import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NailyWave } from '../mascot';
import { fetchTransactions } from '../utils/api';
import { COLORS } from '../utils/config';
import { Button, Card } from '../components';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function HomeScreen({ navigation }: Props) {
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [txnCount, setTxnCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      fetchTransactions({ today: true })
        .then((txns) => {
          if (!active) return;
          const total = txns.reduce(
            (sum: number, t: any) => sum + parseFloat(t.amount),
            0
          );
          setTodayTotal(total);
          setTxnCount(txns.length);
        })
        .catch(() => {})
        .finally(() => active && setLoading(false));
      return () => { active = false; };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={styles.header}
        onLongPress={() => __DEV__ && navigation.navigate('UIKit' as any)}
        delayLongPress={800}
      >
        <NailyWave size={100} />
        <Text style={styles.logo}>Nail<Text style={styles.logoAccent}>IT</Text></Text>
      </Pressable>

      <Card centered style={styles.cardSpacing}>
        <Text style={styles.cardLabel}>Demo Construction Co.</Text>
        <Text style={styles.cardSubtext}>Tap to Pay Terminal</Text>
      </Card>

      <Card centered style={styles.cardSpacing}>
        <Text style={styles.cardLabel}>Today's Total</Text>
        {loading ? (
          <ActivityIndicator color={COLORS.orange} size="small" />
        ) : (
          <>
            <Text style={styles.totalAmount}>
              ${todayTotal.toFixed(2)}
            </Text>
            <Text style={styles.txnCount}>
              {txnCount} payment{txnCount !== 1 ? 's' : ''}
            </Text>
          </>
        )}
      </Card>

      <Button
        variant="primary"
        onPress={() => navigation.navigate('CollectPayment')}
        style={styles.collectButton}
      >
        Collect Payment
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.navy,
  },
  logoAccent: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.orange,
  },
  cardSpacing: {
    marginTop: 12,
    marginHorizontal: 20,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  cardSubtext: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.navy,
    marginTop: 6,
  },
  txnCount: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
  },
  collectButton: {
    marginTop: 24,
    marginHorizontal: 20,
  },
});
