import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, RefreshControl,
} from 'react-native';
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '../api/hooks/useTransactions';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { formatCurrency, formatDate, Category } from '@family-budget/shared';

export default function TransactionsScreen() {
  const { data, isLoading, refetch } = useTransactions({ limit: 30 });
  const createTx = useCreateTransaction();
  const deleteTx = useDeleteTransaction();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    description: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const r = await api.get('/categories'); return r.data; },
  });

  const filteredCats = (categories as Category[]).filter((c) => c.type === form.type);

  const handleSubmit = () => {
    if (!form.amount || !form.description || !form.categoryId) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    createTx.mutate(
      {
        amount: parseFloat(form.amount),
        description: form.description,
        type: form.type,
        categoryId: form.categoryId,
        date: form.date,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({ amount: '', description: '', type: 'EXPENSE', categoryId: '', date: new Date().toISOString().split('T')[0] });
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Transactions</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        {(data?.transactions ?? []).map((tx: any) => (
          <TouchableOpacity
            key={tx.id}
            style={styles.txRow}
            onLongPress={() =>
              Alert.alert('Delete', 'Delete this transaction?', [
                { text: 'Cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteTx.mutate(tx.id) },
              ])
            }
          >
            <Text style={styles.txIcon}>{tx.category?.icon ?? '📦'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.txDesc}>{tx.description}</Text>
              <Text style={styles.txMeta}>{tx.category?.name} - {formatDate(tx.date)}</Text>
            </View>
            <Text style={[styles.txAmount, { color: tx.type === 'INCOME' ? '#059669' : '#dc2626' }]}>
              {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Transaction</Text>

            {/* Type toggle */}
            <View style={styles.typeRow}>
              {(['EXPENSE', 'INCOME'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeBtn,
                    form.type === type && (type === 'EXPENSE' ? styles.expenseActive : styles.incomeActive),
                  ]}
                  onPress={() => setForm({ ...form, type, categoryId: '' })}
                >
                  <Text style={[
                    styles.typeBtnText,
                    form.type === type && { color: type === 'EXPENSE' ? '#dc2626' : '#059669' },
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="decimal-pad"
              value={form.amount}
              onChangeText={(v) => setForm({ ...form, amount: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
            />

            <ScrollView horizontal style={styles.catScroll} showsHorizontalScrollIndicator={false}>
              {filteredCats.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catChip, form.categoryId === cat.id && styles.catChipActive]}
                  onPress={() => setForm({ ...form, categoryId: cat.id })}
                >
                  <Text>{cat.icon} {cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={{ color: '#6b7280' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {createTx.isPending ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  addBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  txRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14, marginHorizontal: 16,
    backgroundColor: '#fff', borderRadius: 10, marginBottom: 8,
  },
  txIcon: { fontSize: 22, marginRight: 12 },
  txDesc: { fontSize: 15, fontWeight: '500', color: '#111827' },
  txMeta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', backgroundColor: '#f3f4f6' },
  typeBtnText: { fontWeight: '600', color: '#6b7280' },
  expenseActive: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5' },
  incomeActive: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#6ee7b7' },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12,
    marginBottom: 12, fontSize: 16,
  },
  catScroll: { marginBottom: 16 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  catChipActive: { backgroundColor: '#dbeafe', borderWidth: 1, borderColor: '#93c5fd' },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#f3f4f6' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#2563eb' },
});
