import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NailyWave } from '../mascot';
import { fetchTransactions } from '../utils/api';
import { COLORS } from '../utils/config';

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
      <View style={styles.header}>
        <Text style={styles.logo}>NailIt</Text>
        <NailyWave size={80} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Demo Construction Co.</Text>
        <Text style={styles.cardSubtext}>Tap to Pay Terminal</Text>
      </View>

      <View style={styles.card}>
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
      </View>

      <TouchableOpacity
        style={styles.collectButton}
        onPress={() => navigation.navigate('CollectPayment')}
        activeOpacity={0.8}
      >
        <Text style={styles.collectButtonText}>Collect Payment</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.navy,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  cardSubtext: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.navy,
    marginTop: 8,
  },
  txnCount: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  collectButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  collectButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },
});
