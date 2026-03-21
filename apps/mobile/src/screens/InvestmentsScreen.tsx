import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { formatCurrency } from '@family-budget/shared';

export default function InvestmentsScreen() {
  const { data: projection, isLoading, refetch } = useQuery({
    queryKey: ['investment-projection'],
    queryFn: async () => { const r = await api.get('/investments/projection'); return r.data; },
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      <Text style={styles.header}>Investments</Text>

      {projection && (
        <>
          <View style={styles.cardRow}>
            <View style={[styles.card, { backgroundColor: '#ecfdf5' }]}>
              <Text style={styles.cardLabel}>Monthly Savings</Text>
              <Text style={[styles.cardValue, { color: '#059669' }]}>
                {formatCurrency(projection.monthlySavings)}
              </Text>
            </View>
            <View style={[styles.card, { backgroundColor: '#eff6ff' }]}>
              <Text style={styles.cardLabel}>Monthly Investment</Text>
              <Text style={[styles.cardValue, { color: '#2563eb' }]}>
                {formatCurrency(projection.monthlyInvestment)}
              </Text>
            </View>
          </View>

          {/* Projection table */}
          <View style={styles.projectionCard}>
            <Text style={styles.sectionTitle}>Growth Projection</Text>
            <Text style={styles.configText}>
              {projection.config.savingsPercentage}% of savings at {projection.config.expectedReturnRate}% annual return
            </Text>

            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>Year</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>Invested</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>Returns</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>Total</Text>
            </View>

            {(projection.projections ?? []).map((row: any) => (
              <View key={row.year} style={styles.tableRow}>
                <Text style={styles.tableCell}>{row.year}</Text>
                <Text style={styles.tableCell}>{formatCurrency(row.invested)}</Text>
                <Text style={[styles.tableCell, { color: '#059669' }]}>{formatCurrency(row.returns)}</Text>
                <Text style={[styles.tableCell, { fontWeight: '600' }]}>{formatCurrency(row.totalValue)}</Text>
              </View>
            ))}
          </View>

          {/* Tips */}
          {projection.allocation?.tips && (
            <View style={styles.tipsCard}>
              <Text style={styles.sectionTitle}>Tips & Insights</Text>
              {projection.allocation.tips.map((tip: string, i: number) => (
                <View key={i} style={styles.tipRow}>
                  <Text style={styles.tipBullet}>-</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  card: { flex: 1, padding: 16, borderRadius: 12 },
  cardLabel: { fontSize: 13, color: '#6b7280' },
  cardValue: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  projectionCard: {
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  configText: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 8 },
  tableHeaderText: { fontWeight: '600', color: '#374151', fontSize: 12 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tableCell: { flex: 1, fontSize: 13, color: '#374151' },
  tipsCard: {
    backgroundColor: '#fffbeb', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#fde68a',
  },
  tipRow: { flexDirection: 'row', marginBottom: 8 },
  tipBullet: { color: '#d97706', marginRight: 8, fontWeight: 'bold' },
  tipText: { flex: 1, fontSize: 14, color: '#92400e', lineHeight: 20 },
});
