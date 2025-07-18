import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useFinanceStore } from '@/lib/store';
import { format, eachMonthOfInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useRouter } from 'expo-router';

type Transaction = {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  paymentMethod: string;
  type: 'expense' | 'income';
};

const windowWidth = Dimensions.get('window').width;

export default function HistoryScreen() {
  const { transactions, removeTransaction } = useFinanceStore();
  const router = useRouter();

  // Default to current month.
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(now));

  // Build an array for the last 6 months.
  const last6Months = eachMonthOfInterval({
    start: startOfMonth(subMonths(now, 5)),
    end: endOfMonth(now),
  });
  const monthOptions = last6Months.map(date => ({
    label: format(date, 'MMM yyyy'),
    date,
  }));

  // Filter transactions for the selected month.
  const filteredTransactions: Transaction[] = transactions
    .filter(t => {
      const d = new Date(t.date);
      return d >= selectedMonth && d <= endOfMonth(selectedMonth);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Handler for deletion.
  const handleDelete = (id: string): void => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeTransaction(id) },
      ]
    );
  };

  // Render swipeable right action.
  const renderRightActions = (transactionId: string): JSX.Element => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(transactionId)}>
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  // Navigate to Edit Transaction screen on tap.
  const handleEdit = (transactionId: string): void => {
    router.push({ pathname: '/editTransaction', params: { id: transactionId } } as any);
  };

  // Render each transaction item.
  const renderItem = ({ item }: { item: Transaction }): JSX.Element => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <TouchableOpacity style={styles.transactionItem} onPress={() => handleEdit(item.id)}>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionNote} numberOfLines={1}>{item.note}</Text>
          <Text style={styles.transactionDate}>{format(new Date(item.date), 'PPp')}</Text>
        </View>
        <Text style={[styles.transactionAmount, { color: item.amount < 0 ? '#ff3b30' : '#34c759' }]}>
          {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );

  // Render each filter button.
  const renderFilterItem = ({ item }: { item: { label: string; date: Date } }): JSX.Element => {
    const isActive = format(selectedMonth, 'MMM yyyy') === item.label;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setSelectedMonth(item.date)}
      >
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>
      <FlatList
        data={monthOptions}
        horizontal
        keyExtractor={(item) => item.label}
        renderItem={renderFilterItem}
        contentContainerStyle={styles.filterContainer}
        showsHorizontalScrollIndicator={false}
      />
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.noTransactions}>No transactions in this month</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1c1c1e',
    textAlign: 'center',
  },
  filterContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 5,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
  },
  filterTextActive: {
    color: 'white',
    fontFamily: 'Inter-Bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 5,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionDetails: {
    flex: 1,
    marginRight: 10,
  },
  transactionNote: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1c1c1e',
  },
  transactionDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8e8e93',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 5,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  noTransactions: {
    textAlign: 'center',
    color: '#8e8e93',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    paddingVertical: 20,
  },
});

export { };
