import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  TextInput,
  FlatList,
} from 'react-native';
import { useFinanceStore, Transaction } from '@/lib/store';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';

type SummaryPeriod = 'day' | 'week' | 'month' | 'all' | 'custom';

export default function SummaryScreen() {
  const { transactions } = useFinanceStore();
  const router = useRouter();
  const [period, setPeriod] = useState<SummaryPeriod>('month');
  const [exporting, setExporting] = useState<boolean>(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'date' | 'amount' | 'category'>('date');

  // Determine date range based on the selected period.
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'day':
        return { startDate: startOfDay(now), endDate: endOfDay(now) };
      case 'week':
        return { startDate: startOfWeek(now), endDate: endOfWeek(now) };
      case 'month':
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
      case 'custom':
        return { startDate: customStartDate || new Date(0), endDate: customEndDate || now };
      case 'all':
      default:
        return { startDate: new Date(0), endDate: now };
    }
  }, [period, customStartDate, customEndDate]);

  // Filter and sort transactions.
  const filteredTransactions = useMemo((): Transaction[] => {
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        const note = t.note || '';
        return d >= startDate && d <= endDate && note.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        if (sortOption === 'date')
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortOption === 'amount')
          return Math.abs(b.amount) - Math.abs(a.amount);
        if (sortOption === 'category')
          return a.category.localeCompare(b.category);
        return 0;
      });
  }, [transactions, startDate, endDate, searchQuery, sortOption]);

  // Compute totals.
  const totalExpense = useMemo((): number => {
    return filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [filteredTransactions]);

  const totalIncome = useMemo((): number => {
    return filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  // Group transactions by category.
  const groupByCategory = useMemo(() => {
    const groups: Record<string, { expense: number; income: number }> = {};
    filteredTransactions.forEach(t => {
      const key = t.category || 'Other';
      if (!groups[key]) {
        groups[key] = { expense: 0, income: 0 };
      }
      if (t.amount < 0) groups[key].expense += Math.abs(t.amount);
      else groups[key].income += t.amount;
    });
    return Object.entries(groups).map(([category, { expense, income }]) => ({
      category,
      expense,
      income,
    }));
  }, [filteredTransactions]);

  // Export function placeholder.
  const handleExport = async () => {
    setExporting(true);
    try {
      // Simulate export delay. Replace with your actual Excel export logic.
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert("Export", "Summary exported successfully!");
    } catch (error) {
      Alert.alert("Export Error", "There was an error exporting your summary.");
    } finally {
      setExporting(false);
    }
  };

  // Render period selector button.
  const renderPeriodButton = (p: SummaryPeriod, label: string) => {
    const active = period === p;
    return (
      <TouchableOpacity
        style={[styles.periodButton, active && styles.periodButtonActive]}
        onPress={() => setPeriod(p)}
      >
        <Text style={[styles.periodText, active && styles.periodTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  // Render the table header.
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableCell, styles.headerCell, { flex: 1.2 }]}>Date</Text>
      <Text style={[styles.tableCell, styles.headerCell, { flex: 2 }]}>Description</Text>
      <Text style={[styles.tableCell, styles.headerCell, { flex: 1.2 }]}>Category</Text>
      <Text style={[styles.tableCell, styles.headerCell, { flex: 1.2 }]}>Card</Text>
      <Text style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>Expense</Text>
      <Text style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>Income</Text>
    </View>
  );

  // Render each table row.
  const renderTableRow = useCallback(({ item }: { item: Transaction }) => {
    const dateStr = format(new Date(item.date), 'MMM dd, yyyy');
    return (
      <TouchableOpacity
        style={styles.tableRow}
        onPress={() => router.push({ pathname: '/transactionDetail', params: { id: item.id } } as any)}
        accessible={true}
        accessibilityLabel={`Transaction on ${dateStr}: ${item.note}`}
        accessibilityRole="button"
      >
        <Text style={[styles.tableCell, { flex: 1.2 }]} numberOfLines={1}>{dateStr}</Text>
        <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>{item.note || '—'}</Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]} numberOfLines={1}>{item.category}</Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]} numberOfLines={1}>{item.paymentMethod}</Text>
        <Text style={[styles.tableCell, { flex: 1, color: item.amount < 0 ? '#ff3b30' : '#000' }]} numberOfLines={1}>
          {item.amount < 0 ? `-$${Math.abs(item.amount).toFixed(2)}` : ''}
        </Text>
        <Text style={[styles.tableCell, { flex: 1, color: item.amount > 0 ? '#34c759' : '#000' }]} numberOfLines={1}>
          {item.amount > 0 ? `+$${item.amount.toFixed(2)}` : ''}
        </Text>
      </TouchableOpacity>
    );
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredTransactions}
        renderItem={renderTableRow}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.screenTitle}>Summary</Text>
            {/* Search & Sort */}
            <View style={styles.searchSortContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search transactions..."
                placeholderTextColor="#555"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <View style={styles.sortOptions}>
                <TouchableOpacity onPress={() => setSortOption('date')}>
                  <Text style={sortOption === 'date' ? styles.sortOptionActive : styles.sortOption}>
                    Date
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSortOption('amount')}>
                  <Text style={sortOption === 'amount' ? styles.sortOptionActive : styles.sortOption}>
                    Amount
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSortOption('category')}>
                  <Text style={sortOption === 'category' ? styles.sortOptionActive : styles.sortOption}>
                    Category
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Period Selector */}
            <View style={styles.periodSelector}>
              {renderPeriodButton('day', 'Day')}
              {renderPeriodButton('week', 'Week')}
              {renderPeriodButton('month', 'Month')}
              {renderPeriodButton('all', 'All')}
              {renderPeriodButton('custom', 'Custom')}
            </View>
            {/* Custom Date Pickers */}
            {period === 'custom' && (
              <View style={styles.customDateContainer}>
                <View style={styles.customDateColumn}>
                  <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowStartDatePicker(true)}>
                    <Text style={styles.datePickerText}>
                      Start: {customStartDate ? format(customStartDate, 'MMM dd, yyyy') : 'Select Date'}
                    </Text>
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={customStartDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (selectedDate) setCustomStartDate(selectedDate);
                      }}
                    />
                  )}
                </View>
                <View style={styles.customDateColumn}>
                  <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowEndDatePicker(true)}>
                    <Text style={styles.datePickerText}>
                      End: {customEndDate ? format(customEndDate, 'MMM dd, yyyy') : 'Select Date'}
                    </Text>
                  </TouchableOpacity>
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={customEndDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        if (selectedDate) setCustomEndDate(selectedDate);
                      }}
                    />
                  )}
                </View>
              </View>
            )}
            {/* Totals Card */}
            <View style={styles.totalsCard}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total Expense</Text>
                <Text style={[styles.totalsValue, { color: '#ff3b30' }]}>- ${totalExpense.toFixed(2)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total Income</Text>
                <Text style={[styles.totalsValue, { color: '#34c759' }]}>+ ${totalIncome.toFixed(2)}</Text>
              </View>
            </View>
            {/* Table Header */}
            {renderTableHeader()}
          </>
        }
        ListEmptyComponent={<Text style={styles.noData}>No transactions available for this period.</Text>}
        ListFooterComponent={
          <TouchableOpacity style={styles.exportButton} onPress={handleExport} disabled={exporting}>
            {exporting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.exportButtonText}>Export to Excel</Text>
            )}
          </TouchableOpacity>
        }
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    padding: 15,
    paddingBottom: 40,
    backgroundColor: '#f8f9fa',
  },
  screenTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1c1c1e',
    textAlign: 'center',
    marginBottom: 15,
  },
  searchSortContainer: {
    marginVertical: 10,
  },
  searchInput: {
    backgroundColor: '#e5e5e5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333', // Darker text for clarity
    marginBottom: 10,
  },
  sortOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sortOption: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
  },
  sortOptionActive: {
    color: '#007AFF',
    fontFamily: 'Inter-Bold',
  },
  periodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e5e5e5',
    marginVertical: 5,
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
  },
  periodTextActive: {
    color: 'white',
    fontFamily: 'Inter-Bold',
  },
  customDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  customDateColumn: {
    flex: 1,
    alignItems: 'center',
  },
  datePickerButton: {
    backgroundColor: '#e5e5e5',
    padding: 10,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginBottom: 5,
  },
  datePickerText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
  },
  totalsCard: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  totalsLabel: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  totalsValue: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: '#007AFF',
    paddingBottom: 5,
    marginBottom: 10,
  },
  headerCell: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#1c1c1e',
  },
  tableCell: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
    paddingHorizontal: 3,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
  },
  exportButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  exportButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8e8e93',
    marginTop: 20,
  },
});

export { };
