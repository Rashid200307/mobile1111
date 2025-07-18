import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import {
  VictoryPie,
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryLine,
} from 'victory-native';
import { useFinanceStore } from '@/lib/store';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
  addMonths,
} from 'date-fns';

export default function AnalyticsScreen() {
  const { transactions } = useFinanceStore();

  // Filter only expense transactions.
  const expenseTransactions = transactions.filter((t) => t.amount < 0);

  // Calculate spending by category using expenses only.
  const spendingByCategory = expenseTransactions.reduce((acc, transaction) => {
    const category = transaction.category;
    const customColor = (transaction as any).customColor;
    const color = customColor || getCategoryColor(category);
    if (!acc[category]) {
      acc[category] = { category, amount: 0, color };
    }
    acc[category].amount += Math.abs(transaction.amount);
    return acc;
  }, {} as Record<string, { category: string; amount: number; color: string }>);

  const spendingData = Object.values(spendingByCategory);

  // Calculate monthly spending for the last 6 months (expenses only).
  const last6Months = eachMonthOfInterval({
    start: startOfMonth(subMonths(new Date(), 5)),
    end: endOfMonth(new Date()),
  });

  const monthlyData = last6Months.map((date) => {
    const month = format(date, 'MMM');
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const amount = expenseTransactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { month, amount };
  });

  // Total spending from expenses.
  const totalSpending = spendingData.reduce(
    (sum: number, item) => sum + item.amount,
    0
  );

  // Prediction: Compute average spending and simulate forecast for next 3 months.
  const averageSpending =
    monthlyData.length > 0
      ? monthlyData.reduce((sum, item) => sum + item.amount, 0) /
        monthlyData.length
      : 0;
  const predictedData = Array.from({ length: 3 }).map((_, i) => {
    const futureMonth = format(addMonths(new Date(), i + 1), 'MMM');
    return { month: futureMonth, amount: averageSpending };
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>{format(new Date(), 'MMMM yyyy')}</Text>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Spending</Text>
        <Text style={styles.totalAmount}>${totalSpending.toFixed(2)}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        <View style={styles.chartContainer}>
          <VictoryPie
            data={
              spendingData.length > 0
                ? spendingData
                : [{ category: 'No Data', amount: 1, color: '#ccc' }]
            }
            x="category"
            y="amount"
            width={300}
            height={300}
            colorScale={spendingData.map((d) => d.color)}
            innerRadius={70}
            labels={() => null}
            style={{
              labels: {
                fill: 'white',
                fontSize: 10,
                fontWeight: 'bold',
                textAnchor: 'middle',
              },
            }}
          />
        </View>
        <View style={styles.legendContainer}>
          {spendingData.map((item) => {
            const pct =
              totalSpending > 0 ? (item.amount / totalSpending) * 100 : 0;
            return (
              <View key={item.category} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <View style={styles.legendText}>
                  <Text
                    style={styles.legendCategory}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Overview</Text>
        <View style={styles.barChartContainer}>
          <VictoryChart
            theme={VictoryTheme.material}
            width={Dimensions.get('window').width - 40}
            height={300}
            domainPadding={20}
          >
            <VictoryAxis
              tickFormat={(t) => t}
              style={{ tickLabels: { fontSize: 12, padding: 5 } }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `$${t}`}
              style={{ tickLabels: { fontSize: 12, padding: 5 } }}
            />
            <VictoryBar
              data={monthlyData}
              x="month"
              y="amount"
              style={{
                data: { fill: '#007AFF', width: 20 },
              }}
            />
          </VictoryChart>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Predicted Spending (Next 3 Months)</Text>
        <View style={styles.barChartContainer}>
          <VictoryChart
            theme={VictoryTheme.material}
            width={Dimensions.get('window').width - 40}
            height={300}
            domainPadding={20}
          >
            <VictoryAxis
              tickFormat={(t) => t}
              style={{ tickLabels: { fontSize: 12, padding: 5 } }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `$${t.toFixed(0)}`}
              style={{ tickLabels: { fontSize: 12, padding: 5 } }}
            />
            <VictoryLine
              data={predictedData}
              x="month"
              y="amount"
              style={{
                data: { stroke: '#34C759', strokeWidth: 3 },
              }}
            />
          </VictoryChart>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Returns the default color for a given category.
 * For custom categories, transactions should include a customColor.
 */
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
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
  barChartContainer: {
    backgroundColor: 'white',
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
});
