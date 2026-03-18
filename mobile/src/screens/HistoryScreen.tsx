import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      labor: '#3B82F6',
      materials: '#F59E0B',
      subcontractor: '#8B5CF6',
      equipment: '#10B981',
      other: '#6B7280',
    };
    return colors[cat] || COLORS.gray;
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.txnCard}>
      <View style={styles.txnTop}>
        <Text style={styles.txnAmount}>${parseFloat(item.amount).toFixed(2)}</Text>
        <View style={[styles.categoryPill, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryPillText}>
            {CATEGORIES.find((c) => c.key === item.category)?.label || item.category}
          </Text>
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
      <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? COLORS.green : COLORS.orange }]}>
        <Text style={styles.statusText}>
          {item.status === 'completed' ? 'Completed' : 'Pending'}
        </Text>
      </View>
    </View>
  );

  const allFilters: Array<{ key: Category | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    ...CATEGORIES,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <NailyClipboard size={60} />
        <Text style={styles.title}>History</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={styles.exportBtnText}>CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Offline Queue Banner */}
      {queueCount > 0 && (
        <View style={styles.offlineBanner}>
          {syncing ? <NailySyncing size={40} /> : <NailyOffline size={40} />}
          <Text style={styles.offlineText}>
            {syncing
              ? 'Syncing...'
              : `${queueCount} payment${queueCount > 1 ? 's' : ''} pending sync`}
          </Text>
          {!syncing && (
            <TouchableOpacity style={styles.syncBtn} onPress={handleSync}>
              <Text style={styles.syncBtnText}>Sync Now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filter Bar */}
      <FlatList
        horizontal
        data={allFilters}
        keyExtractor={(f) => f.key}
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.navy, flex: 1 },
  exportBtn: {
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  exportBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  offlineText: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.darkGray },
  syncBtn: { backgroundColor: COLORS.orange, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  syncBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  filterBar: { maxHeight: 44, marginTop: 12, paddingHorizontal: 20 },
  filterPill: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  filterPillActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  filterText: { fontSize: 14, fontWeight: '600', color: COLORS.darkGray },
  filterTextActive: { color: COLORS.white },
  listContent: { padding: 20, paddingTop: 12 },
  txnCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  txnTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txnAmount: { fontSize: 22, fontWeight: '700', color: COLORS.navy },
  categoryPill: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  categoryPillText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  txnDesc: { fontSize: 14, color: COLORS.darkGray, marginTop: 6 },
  txnBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  txnCardInfo: { fontSize: 13, color: COLORS.gray },
  txnTime: { fontSize: 13, color: COLORS.gray },
  statusBadge: { position: 'absolute', top: 12, right: 12, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 18, color: COLORS.gray, marginTop: 16, fontWeight: '600' },
});
