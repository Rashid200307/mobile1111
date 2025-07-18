// app/(tabs)/transactionDetail.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFinanceStore, Transaction } from '@/lib/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const transaction = useFinanceStore(state =>
    state.transactions.find(t => t.id === id)
  );

  if (!transaction) {
    Alert.alert('Error', 'Transaction not found.');
    router.back();
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Transaction Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{format(new Date(transaction.date), 'MMM dd, yyyy')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{transaction.note || '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value}>{transaction.category}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Card:</Text>
          <Text style={styles.value}>{transaction.paymentMethod}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Expense:</Text>
          <Text style={[styles.value, { color: transaction.amount < 0 ? '#ff3b30' : '#000' }]}>
            {transaction.amount < 0 ? `-$${Math.abs(transaction.amount).toFixed(2)}` : '—'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Income:</Text>
          <Text style={[styles.value, { color: transaction.amount > 0 ? '#34c759' : '#000' }]}>
            {transaction.amount > 0 ? `+$${transaction.amount.toFixed(2)}` : '—'}
          </Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1c1c1e',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1c1c1e',
  },
  value: {
    flex: 2,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
  },
  backButton: {
    marginTop: 30,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
});

export { };
