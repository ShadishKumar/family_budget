import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { formatCurrency, formatDate } from '@family-budget/shared';

export default function DashboardScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary');
      return res.data;
    },
  });

  const month = data?.currentMonth;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      <Text style={styles.header}>Dashboard</Text>

      {/* Summary Cards */}
      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: '#ecfdf5' }]}>
          <Text style={styles.cardLabel}>Income</Text>
          <Text style={[styles.cardValue, { color: '#059669' }]}>
            {formatCurrency(month?.totalIncome ?? 0)}
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#fef2f2' }]}>
          <Text style={styles.cardLabel}>Expenses</Text>
          <Text style={[styles.cardValue, { color: '#dc2626' }]}>
            {formatCurrency(month?.totalExpenses ?? 0)}
          </Text>
        </View>
      </View>

      <View style={[styles.savingsCard]}>
        <Text style={styles.cardLabel}>Net Savings This Month</Text>
        <Text
          style={[
            styles.savingsValue,
            { color: (month?.netSavings ?? 0) >= 0 ? '#059669' : '#dc2626' },
          ]}
        >
          {formatCurrency(month?.netSavings ?? 0)}
        </Text>
        {month?.totalIncome > 0 && (
          <Text style={styles.savingsRate}>
            Savings rate: {((month.netSavings / month.totalIncome) * 100).toFixed(1)}%
          </Text>
        )}
      </View>

      {/* Category breakdown */}
      <Text style={styles.sectionTitle}>Top Expenses</Text>
      {(month?.byCategory ?? []).slice(0, 5).map((cat: { categoryName: string; total: number; color?: string }) => (
        <View key={cat.categoryName} style={styles.categoryRow}>
          <View style={[styles.categoryDot, { backgroundColor: cat.color ?? '#9E9E9E' }]} />
          <Text style={styles.categoryName}>{cat.categoryName}</Text>
          <Text style={styles.categoryAmount}>{formatCurrency(cat.total)}</Text>
        </View>
      ))}

      {/* Recent transactions */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {(data?.recentTransactions ?? []).slice(0, 8).map((tx: any) => (
        <View key={tx.id} style={styles.txRow}>
          <Text style={styles.txIcon}>{tx.category?.icon ?? '📦'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.txDesc}>{tx.description}</Text>
            <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
          </View>
          <Text
            style={[
              styles.txAmount,
              { color: tx.type === 'INCOME' ? '#059669' : '#dc2626' },
            ]}
          >
            {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
          </Text>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { flex: 1, padding: 16, borderRadius: 12 },
  cardLabel: { fontSize: 13, color: '#6b7280' },
  cardValue: { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  savingsCard: {
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 20,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  savingsValue: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  savingsRate: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 8, marginBottom: 12 },
  categoryRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  categoryName: { flex: 1, fontSize: 15, color: '#374151' },
  categoryAmount: { fontSize: 15, fontWeight: '600', color: '#111827' },
  txRow: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: '#fff', borderRadius: 10, marginBottom: 8,
  },
  txIcon: { fontSize: 20, marginRight: 10 },
  txDesc: { fontSize: 14, fontWeight: '500', color: '#111827' },
  txDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '600' },
});
