import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { VictoryPie } from 'victory-native';
import { useFinanceStore } from '@/lib/store';
import { useProfileStore } from '@/st/store';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Helper: Compute a greeting based on current hour and full name.
function getGreeting(fullName: string): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return `Good morning, ${fullName}`;
  } else if (hour < 18) {
    return `Good afternoon, ${fullName}`;
  } else if (hour < 22) {
    return `Good evening, ${fullName}`;
  } else {
    return `Good night, ${fullName}`;
  }
}

// Helper: Return a default color for a given category.
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    Shopping: '#007AFF',
    Food: '#5856D6',
    Transport: '#FF2D55',
    Bills: '#FF9500',
    Other: '#8E8E93',
  };
  return colorMap[category] || '#8E8E93';
}

export default function HomeScreen() {
  // Retrieve transactions and cards from your finance store.
  const { transactions, cards } = useFinanceStore();
  // Retrieve the user's full name from the global profile store.
  const { fullName } = useProfileStore();

  // Determine the greeting message based on the time of day.
  const greetingMessage = getGreeting(fullName);

  // Compute the total balance.
  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);

  // Separate transactions into expenses and incomes.
  const expenses = transactions.filter(t => t.amount < 0);
  const incomes = transactions.filter(t => t.amount > 0);

  // Group expenses by category.
  const expenseByCategory = expenses.reduce((acc, transaction) => {
    const category = transaction.category || 'Other';
    const customColor = (transaction as any).customColor;
    const color = customColor || getCategoryColor(category);
    if (!acc[category]) {
      acc[category] = { category, amount: 0, color };
    }
    acc[category].amount += Math.abs(transaction.amount);
    return acc;
  }, {} as Record<string, { category: string; amount: number; color: string }>);
  const expensePieData = Object.values(expenseByCategory);

  // Group incomes by category.
  const incomeByCategory = incomes.reduce((acc, transaction) => {
    const category = transaction.category || 'Other';
    const customColor = (transaction as any).customColor;
    const color = customColor || getCategoryColor(category);
    if (!acc[category]) {
      acc[category] = { category, amount: 0, color };
    }
    acc[category].amount += transaction.amount;
    return acc;
  }, {} as Record<string, { category: string; amount: number; color: string }>);
  const incomePieData = Object.values(incomeByCategory);

  // Total expenses and total income.
  const totalExpenses = expensePieData.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = incomePieData.reduce((sum, item) => sum + item.amount, 0);

  // Current month transactions.
  const now = new Date();
  const currentMonthTransactions = transactions
    .filter(t => {
      const d = new Date(t.date);
      return d >= startOfMonth(now) && d <= endOfMonth(now);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <ScrollView style={styles.container}>
      {/* Header with dynamic greeting */}
      <LinearGradient
        colors={['#007AFF', '#00C6FB']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.greeting}>{greetingMessage}</Text>
        <Text style={styles.balance}>${totalBalance.toFixed(2)}</Text>
        <Text style={styles.balanceLabel}>Total Balance</Text>
      </LinearGradient>

      {/* Overview Section */}
      <View style={styles.overviewSection}>
        <View style={styles.overviewItem}>
          <Text style={styles.overviewTitle}>Expenses</Text>
          <Text style={[styles.overviewValue, { color: '#ff3b30' }]}>
            ${totalExpenses.toFixed(2)}
          </Text>
        </View>
        <View style={styles.overviewItem}>
          <Text style={styles.overviewTitle}>Income</Text>
          <Text style={[styles.overviewValue, { color: '#34c759' }]}>
            ${totalIncome.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Expenses Pie Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expenses by Category</Text>
        <View style={styles.chartContainer}>
          <VictoryPie
            data={
              expensePieData.length > 0
                ? expensePieData
                : [{ category: 'No Data', amount: 1, color: '#ccc' }]
            }
            x="category"
            y="amount"
            width={300}
            height={300}
            colorScale={expensePieData.map(d => d.color)}
            innerRadius={70}
            labels={() => null}
            style={{
              labels: { fill: 'white', fontSize: 10, fontWeight: 'bold' },
            }}
          />
        </View>
        <View style={styles.legendContainer}>
          {expensePieData.map(item => {
            const pct = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
            return (
              <View key={item.category} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <View style={styles.legendText}>
                  <Text style={styles.legendCategory} numberOfLines={2} ellipsizeMode="tail">
                    {item.category}
                  </Text>
                  <Text style={styles.legendAmount}>
                    ${item.amount.toFixed(2)} ({pct.toFixed(2)}%)
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Income Pie Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Income by Category</Text>
        <View style={styles.chartContainer}>
          <VictoryPie
            data={
              incomePieData.length > 0
                ? incomePieData
                : [{ category: 'No Data', amount: 1, color: '#ccc' }]
            }
            x="category"
            y="amount"
            width={300}
            height={300}
            colorScale={incomePieData.map(d => d.color)}
            innerRadius={70}
            labels={() => null}
            style={{
              labels: { fill: 'white', fontSize: 10, fontWeight: 'bold' },
            }}
          />
        </View>
        <View style={styles.legendContainer}>
          {incomePieData.map(item => {
            const pct = totalIncome > 0 ? (item.amount / totalIncome) * 100 : 0;
            return (
              <View key={item.category} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <View style={styles.legendText}>
                  <Text style={styles.legendCategory} numberOfLines={2} ellipsizeMode="tail">
                    {item.category}
                  </Text>
                  <Text style={styles.legendAmount}>
                    ${item.amount.toFixed(2)} ({pct.toFixed(2)}%)
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Current Month's Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Month's Transactions</Text>
        {currentMonthTransactions.length > 0 ? (
          currentMonthTransactions.map(transaction => (
            <View key={transaction.id} style={styles.transaction}>
              <View>
                <Text style={styles.transactionTitle}>{transaction.note}</Text>
                <Text style={styles.transactionDate}>
                  {format(new Date(transaction.date), 'PPp')}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: transaction.amount < 0 ? '#ff3b30' : '#34c759' },
                ]}
              >
                {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noTransactions}>No transactions this month</Text>
        )}
      </View>
    </ScrollView>
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
  },
  greeting: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 10,
  },
  balance: {
    color: 'white',
    fontSize: 34,
    fontFamily: 'Inter-Bold',
    marginBottom: 5,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1c1c1e',
  },
  subtitle: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: '#8e8e93',
    marginTop: 5,
  },
  totalContainer: {
    padding: 20,
    backgroundColor: '#007AFF',
    margin: 20,
    borderRadius: 16,
  },
  totalLabel: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  totalAmount: {
    fontSize: 34,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  overviewSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8e8e93',
  },
  overviewValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 15,
    color: '#1c1c1e',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  legendContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 2,
  },
  legendText: {
    flex: 1,
    flexDirection: 'column',
  },
  legendCategory: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
    maxWidth: 150,
  },
  legendAmount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1c1c1e',
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  transactionTitle: {
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
  noTransactions: {
    textAlign: 'center',
    color: '#8e8e93',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    paddingVertical: 20,
  },
});

export { };
