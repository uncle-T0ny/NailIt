import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { NailyClipboard, NailyShrug, NailyOffline, NailySyncing } from '../mascot';
import { fetchTransactions, exportTransactionsCSV } from '../utils/api';
import { getQueue, flushQueue } from '../utils/offlineQueue';
import { COLORS, CATEGORIES, Category } from '../utils/config';
import { Button, Card, Chip, Badge, ScreenHeader, Banner } from '../components';

const CATEGORY_COLORS: Record<string, string> = {
  labor: '#3B82F6',
  materials: '#F59E0B',
  subcontractor: '#8B5CF6',
  equipment: '#10B981',
  other: '#6B7280',
};

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [queueCount, setQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const params: any = {};
      if (filter !== 'all') params.category = filter;
      const txns = await fetchTransactions(params);
      setTransactions(txns);
    } catch {}
    const queue = await getQueue();
    setQueueCount(queue.length);
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    const result = await flushQueue();
    setSyncing(false);
    setQueueCount(result.remaining);
    if (result.synced > 0) {
      await loadData();
    }
  };

  const handleExport = async () => {
    try {
      const csv = await exportTransactionsCSV(filter !== 'all' ? filter : undefined);
      const file = new File(Paths.cache, 'nailit_transactions.csv');
      file.write(csv);
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        UTI: 'public.comma-separated-values-text',
      });
    } catch {
      Alert.alert('Export Failed', 'Could not export transactions.');
    }
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <Card variant="transaction">
      <View style={styles.txnTop}>
        <Text style={styles.txnAmount}>${parseFloat(item.amount).toFixed(2)}</Text>
        <View style={styles.badges}>
          <Badge
            variant="status"
            label={item.status === 'completed' ? 'Completed' : 'Pending'}
          />
          <Badge
            variant="category"
            label={CATEGORIES.find((c) => c.key === item.category)?.label || item.category}
            color={CATEGORY_COLORS[item.category] || COLORS.gray}
          />
        </View>
      </View>
      {item.description ? <Text style={styles.txnDesc}>{item.description}</Text> : null}
      <View style={styles.txnBottom}>
        <Text style={styles.txnCardInfo}>
          {item.card_brand ? `${item.card_brand} •••• ${item.card_last4}` : ''}
        </Text>
        <Text style={styles.txnTime}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Card>
  );

  const allFilters: Array<{ key: Category | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    ...CATEGORIES,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="History"
        mascot={<NailyClipboard size={80} />}
        rightAction={
          <Button variant="small" onPress={handleExport}>CSV</Button>
        }
      />

      {/* Offline Queue Banner */}
      {queueCount > 0 && (
        <Banner
          variant="warning"
          icon={syncing ? <NailySyncing size={40} /> : <NailyOffline size={40} />}
          action={!syncing ? { label: 'Sync Now', onPress: handleSync } : undefined}
          style={styles.bannerSpacing}
        >
          {syncing
            ? 'Syncing...'
            : `${queueCount} payment${queueCount > 1 ? 's' : ''} pending sync`}
        </Banner>
      )}

      {/* Filter Bar */}
      <FlatList
        horizontal
        data={allFilters}
        keyExtractor={(f) => f.key}
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        renderItem={({ item: f }) => (
          <Chip
            label={f.label}
            active={filter === f.key}
            onPress={() => setFilter(f.key)}
            activeColor="navy"
          />
        )}
      />

      {/* Transaction List */}
      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id?.toString() || t.stripe_payment_intent_id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <NailyShrug size={160} />
            <Text style={styles.emptyText}>No payments yet — go nail it!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  bannerSpacing: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  filterBar: { maxHeight: 44, marginTop: 12, paddingHorizontal: 20 },
  listContent: { padding: 20, paddingTop: 12 },
  txnTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txnAmount: { fontSize: 22, fontWeight: '700', color: COLORS.navy },
  badges: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  txnDesc: { fontSize: 14, color: COLORS.darkGray, marginTop: 6 },
  txnBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  txnCardInfo: { fontSize: 13, color: COLORS.gray },
  txnTime: { fontSize: 13, color: COLORS.gray },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 18, color: COLORS.gray, marginTop: 16, fontWeight: '600' },
});
