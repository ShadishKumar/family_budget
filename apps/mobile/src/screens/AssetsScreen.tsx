import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { formatCurrency } from '@family-budget/shared';

const typeLabels: Record<string, string> = {
  PROPERTY: 'Property', VEHICLE: 'Vehicle', INVESTMENT: 'Investment',
  GOLD: 'Gold', CASH: 'Cash', CRYPTO: 'Crypto', OTHER: 'Other',
};

const typeColors: Record<string, string> = {
  PROPERTY: '#d97706', VEHICLE: '#2563eb', INVESTMENT: '#059669',
  GOLD: '#eab308', CASH: '#10b981', CRYPTO: '#7c3aed', OTHER: '#6b7280',
};

export default function AssetsScreen() {
  const { data: assets = [], isLoading, refetch } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => { const r = await api.get('/assets'); return r.data; },
  });

  const { data: netWorth } = useQuery({
    queryKey: ['net-worth'],
    queryFn: async () => { const r = await api.get('/assets/net-worth'); return r.data; },
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      <Text style={styles.header}>Assets</Text>

      <View style={styles.netWorthCard}>
        <Text style={styles.netWorthLabel}>Total Net Worth</Text>
        <Text style={styles.netWorthValue}>{formatCurrency(netWorth?.totalAssets ?? 0)}</Text>
      </View>

      {(assets as any[]).map((asset) => {
        const gain = asset.purchaseValue
          ? Number(asset.currentValue) - Number(asset.purchaseValue)
          : null;

        return (
          <View key={asset.id} style={styles.assetCard}>
            <View style={[styles.typeBadge, { backgroundColor: typeColors[asset.type] + '20' }]}>
              <Text style={[styles.typeBadgeText, { color: typeColors[asset.type] }]}>
                {typeLabels[asset.type]}
              </Text>
            </View>
            <Text style={styles.assetName}>{asset.name}</Text>
            <Text style={styles.assetValue}>{formatCurrency(Number(asset.currentValue))}</Text>
            {gain !== null && (
              <Text style={[styles.gain, { color: gain >= 0 ? '#059669' : '#dc2626' }]}>
                {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
              </Text>
            )}
          </View>
        );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  netWorthCard: {
    backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  netWorthLabel: { fontSize: 14, color: '#6b7280' },
  netWorthValue: { fontSize: 30, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  assetCard: {
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#f3f4f6',
  },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  typeBadgeText: { fontSize: 12, fontWeight: '600' },
  assetName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  assetValue: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  gain: { fontSize: 14, marginTop: 2 },
});
