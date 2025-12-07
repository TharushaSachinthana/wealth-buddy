import React from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext-v2';
import * as db from '../core/db-v2';
import { generateMonthlyReportCSV, downloadCSV } from '../utils/csvExport';
import { colors, spacing, borderRadius, shadows, typography, cardStyles } from '../theme';

// Conditionally import Victory charts
let VictoryPie, VictoryChart, VictoryBar, VictoryLine, VictoryTheme, VictoryAxis;
try {
  const Victory = require('victory-native');
  VictoryPie = Victory.VictoryPie;
  VictoryChart = Victory.VictoryChart;
  VictoryBar = Victory.VictoryBar;
  VictoryLine = Victory.VictoryLine;
  VictoryTheme = Victory.VictoryTheme;
  VictoryAxis = Victory.VictoryAxis;
} catch (e) {
  console.warn('Victory charts not available, using fallback UI');
}

const { width } = Dimensions.get('window');

// Custom dark theme for Victory charts
const darkChartTheme = {
  axis: {
    style: {
      axis: { stroke: colors.border.medium },
      tickLabels: { fill: colors.text.secondary, fontSize: 10 },
      grid: { stroke: colors.border.light, strokeDasharray: '4,4' },
    },
  },
};

export default function DashboardScreen() {
  const { user, allocation, goals, recurring, transactions, categories, currentMonth, loading, navigateMonth } = useApp();

  // Calculate actual totals from transactions
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const netAmount = totalIncome - totalExpenses;
  const totalRecurring = recurring.reduce((sum, r) => sum + (r.amount || 0), 0);

  // Calculate actual allocation based on real income
  const actualIncome = totalIncome > 0 ? totalIncome : (user?.salary || 0);
  const actualAllocation = user ? db.calculateAllocation({ ...user, salary: actualIncome }) : allocation;

  // Calculate savings score
  const calculateSavingsScore = () => {
    if (!user || actualIncome === 0) return { score: 'N/A', color: colors.text.muted, message: 'No data', icon: 'help-circle', percent: 0 };

    const expectedSavings = (actualIncome * (user.savingsPercent || 15)) / 100;
    const actualSavings = netAmount > 0 ? netAmount : 0;
    const savingsRatio = expectedSavings > 0 ? (actualSavings / expectedSavings) * 100 : 0;

    if (savingsRatio >= 100) return { score: 'Excellent', color: colors.success.main, message: 'Outstanding!', icon: 'trophy', percent: savingsRatio };
    if (savingsRatio >= 75) return { score: 'Great', color: colors.success.light, message: 'Keep it up!', icon: 'check-circle', percent: savingsRatio };
    if (savingsRatio >= 50) return { score: 'Good', color: colors.warning.main, message: 'On track', icon: 'alert-circle', percent: savingsRatio };
    if (savingsRatio >= 25) return { score: 'Fair', color: colors.danger.light, message: 'Need improvement', icon: 'alert', percent: savingsRatio };
    return { score: 'Low', color: colors.danger.main, message: 'Critical', icon: 'alert-octagon', percent: savingsRatio };
  };

  const savingsScore = calculateSavingsScore();

  // Find maximum expense
  const expenseTransactions = transactions.filter(t => t.amount < 0);
  const maxExpense = expenseTransactions.length > 0
    ? expenseTransactions.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max, expenseTransactions[0])
    : null;

  // Expenses by category for pie chart
  const expensesByCategory = {};
  expenseTransactions.forEach(t => {
    const category = categories.find(c => c.id === t.categoryId);
    const catName = category?.name || 'Other';
    if (!expensesByCategory[catName]) expensesByCategory[catName] = 0;
    expensesByCategory[catName] += Math.abs(t.amount);
  });

  const categoryChartData = Object.entries(expensesByCategory).map(([name, amount]) => ({
    x: name.length > 8 ? name.substring(0, 8) + '...' : name,
    y: amount,
    label: `Rs. ${(amount / 1000).toFixed(1)}k`,
  }));

  const pieData = Object.entries(expensesByCategory).map(([name, amount]) => ({
    x: name,
    y: amount,
  }));

  // Daily spending trend (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(currentMonth);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayExpenses = expenseTransactions
      .filter(t => t.date === dateStr)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    last7Days.push({
      x: date.toLocaleDateString('en-US', { weekday: 'short' }),
      y: dayExpenses,
    });
  }

  // Allocation data for chart
  const allocationData = actualAllocation ? [
    { x: 'Essentials', y: actualAllocation.essentials || 0 },
    { x: 'Savings', y: actualAllocation.savings || 0 },
    { x: 'Discretionary', y: actualAllocation.discretionary || 0 },
    { x: 'Buffer', y: actualAllocation.buffer || 0 },
  ] : [];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading your finances...</Text>
        </View>
      </View>
    );
  }

  const monthString = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handleDownloadReport = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const allTransactions = await db.getAllTransactionsForMonth(year, month);

      const csvContent = generateMonthlyReportCSV(allTransactions, categories, user, year, month);
      const filename = `Monthly_Report_${year}_${String(month).padStart(2, '0')}.csv`;

      const success = downloadCSV(csvContent, filename);
      if (success) {
        Alert.alert('Success', 'Monthly report downloaded successfully!');
      } else {
        Alert.alert('Error', 'Failed to download report. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient Background */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'User'} 👋</Text>
          </View>
          <View style={styles.monthNav}>
            <IconButton
              icon="chevron-left"
              size={22}
              iconColor={colors.text.primary}
              onPress={() => navigateMonth(-1)}
              style={styles.monthButton}
            />
            <Text style={styles.monthText}>{monthString}</Text>
            <IconButton
              icon="chevron-right"
              size={22}
              iconColor={colors.text.primary}
              onPress={() => navigateMonth(1)}
              style={styles.monthButton}
            />
          </View>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <View style={styles.summaryIconContainer}>
              <MaterialCommunityIcons name="trending-up" size={24} color={colors.success.main} />
            </View>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: colors.success.main }]}>
              Rs. {totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <View style={styles.summaryIconContainer}>
              <MaterialCommunityIcons name="trending-down" size={24} color={colors.danger.main} />
            </View>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: colors.danger.main }]}>
              Rs. {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>

        {/* Net Balance Card */}
        <View style={[styles.netCard, netAmount >= 0 ? styles.netPositive : styles.netNegative]}>
          <View style={styles.netContent}>
            <View>
              <Text style={styles.netLabel}>Net Balance</Text>
              <Text style={[styles.netAmount, { color: netAmount >= 0 ? colors.success.main : colors.danger.main }]}>
                {netAmount >= 0 ? '+' : '-'} Rs. {Math.abs(netAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Text>
            </View>
            <View style={[styles.netIcon, { backgroundColor: netAmount >= 0 ? colors.success.glow : colors.danger.glow }]}>
              <MaterialCommunityIcons
                name={netAmount >= 0 ? 'arrow-up-circle' : 'arrow-down-circle'}
                size={32}
                color={netAmount >= 0 ? colors.success.main : colors.danger.main}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Savings Score Card */}
      <View style={styles.glassCard}>
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreCircle, { borderColor: savingsScore.color }]}>
            <MaterialCommunityIcons name={savingsScore.icon} size={28} color={savingsScore.color} />
            <Text style={[styles.scorePercent, { color: savingsScore.color }]}>
              {Math.min(savingsScore.percent, 100).toFixed(0)}%
            </Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreTitle}>Savings Score</Text>
            <Text style={[styles.scoreValue, { color: savingsScore.color }]}>{savingsScore.score}</Text>
            <Text style={styles.scoreMessage}>{savingsScore.message}</Text>
          </View>
        </View>
      </View>

      {/* Charts Section */}
      {expenseTransactions.length > 0 && (
        <>
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Expenses by Category</Text>
            <View style={styles.chartContainer}>
              {pieData.length > 0 && VictoryPie ? (
                <VictoryPie
                  data={pieData}
                  height={260}
                  innerRadius={50}
                  padAngle={2}
                  colorScale={[colors.primary.main, colors.success.main, colors.warning.main, colors.danger.main, colors.accent.purple, colors.accent.pink]}
                  style={{
                    labels: {
                      fontSize: 10,
                      fill: colors.text.primary,
                    },
                  }}
                  labelRadius={({ innerRadius }) => innerRadius + 35}
                />
              ) : (
                <View style={styles.fallbackChart}>
                  {Object.entries(expensesByCategory).map(([name, amount], index) => {
                    const percentage = (amount / totalExpenses) * 100;
                    const chartColors = [colors.primary.main, colors.success.main, colors.warning.main, colors.danger.main, colors.accent.purple];
                    return (
                      <View key={name} style={styles.categoryBar}>
                        <View style={styles.categoryBarHeader}>
                          <View style={styles.categoryNameRow}>
                            <View style={[styles.categoryDot, { backgroundColor: chartColors[index % chartColors.length] }]} />
                            <Text style={styles.categoryName}>{name}</Text>
                          </View>
                          <Text style={styles.categoryAmount}>Rs. {amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
                        </View>
                        <View style={styles.categoryBarContainer}>
                          <View style={[styles.categoryBarFill, { width: `${percentage}%`, backgroundColor: chartColors[index % chartColors.length] }]} />
                        </View>
                        <Text style={styles.categoryPercent}>{percentage.toFixed(1)}%</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {last7Days.some(d => d.y > 0) && (
            <View style={styles.glassCard}>
              <Text style={styles.sectionTitle}>7-Day Spending Trend</Text>
              <View style={styles.chartContainer}>
                {VictoryChart && VictoryBar ? (
                  <VictoryChart
                    height={200}
                    padding={{ left: 50, right: 20, top: 20, bottom: 40 }}
                  >
                    <VictoryAxis
                      style={{
                        axis: { stroke: colors.border.medium },
                        tickLabels: { fill: colors.text.secondary, fontSize: 10 },
                      }}
                    />
                    <VictoryAxis
                      dependentAxis
                      style={{
                        axis: { stroke: colors.border.medium },
                        tickLabels: { fill: colors.text.secondary, fontSize: 10 },
                      }}
                    />
                    <VictoryBar
                      data={last7Days}
                      style={{
                        data: {
                          fill: colors.primary.main,
                          fillOpacity: 0.8,
                        },
                      }}
                      cornerRadius={{ top: 6 }}
                    />
                  </VictoryChart>
                ) : (
                  <View style={styles.trendChart}>
                    {last7Days.map((day, index) => {
                      const maxValue = Math.max(...last7Days.map(d => d.y), 1);
                      const height = (day.y / maxValue) * 100;
                      return (
                        <View key={index} style={styles.trendItem}>
                          <View style={styles.trendBarContainer}>
                            <View style={[styles.trendBar, { height: `${height}%` }]} />
                          </View>
                          <Text style={styles.trendLabel}>{day.x}</Text>
                          <Text style={styles.trendValue}>
                            {day.y > 0 ? `${(day.y / 1000).toFixed(1)}k` : '-'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}
        </>
      )}

      {/* Allocation Chart */}
      {allocationData.length > 0 && (
        <View style={styles.glassCard}>
          <Text style={styles.sectionTitle}>Budget Allocation</Text>
          <View style={styles.allocationGrid}>
            {allocationData.map((item, index) => {
              const iconMap = {
                'Essentials': { icon: 'home', color: colors.danger.main },
                'Savings': { icon: 'piggy-bank', color: colors.success.main },
                'Discretionary': { icon: 'shopping', color: colors.primary.main },
                'Buffer': { icon: 'shield-check', color: colors.warning.main },
              };
              const config = iconMap[item.x] || { icon: 'cash', color: colors.text.muted };
              return (
                <View key={item.x} style={styles.allocationItem}>
                  <View style={[styles.allocationIcon, { backgroundColor: `${config.color}20` }]}>
                    <MaterialCommunityIcons name={config.icon} size={24} color={config.color} />
                  </View>
                  <Text style={styles.allocationLabel}>{item.x}</Text>
                  <Text style={[styles.allocationValue, { color: config.color }]}>
                    Rs. {item.y.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.glassCard}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary.glow }]}>
              <MaterialCommunityIcons name="swap-horizontal" size={20} color={colors.primary.main} />
            </View>
            <Text style={styles.statValue}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.accent.purple + '30' }]}>
              <MaterialCommunityIcons name="repeat" size={20} color={colors.accent.purple} />
            </View>
            <Text style={styles.statValue}>{recurring.length}</Text>
            <Text style={styles.statLabel}>Recurring</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.warning.glow }]}>
              <MaterialCommunityIcons name="trophy" size={20} color={colors.warning.main} />
            </View>
            <Text style={styles.statValue}>{goals.length}</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
        </View>
      </View>

      {/* Download Button */}
      <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadReport} activeOpacity={0.8}>
        <MaterialCommunityIcons name="download" size={20} color={colors.text.primary} />
        <Text style={styles.downloadButtonText}>Download Monthly Report</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingCard: {
    ...cardStyles.glass,
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
  header: {
    backgroundColor: colors.background.secondary,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  monthButton: {
    margin: 0,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginHorizontal: spacing.sm,
  },
  summaryContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    ...cardStyles.glass,
    padding: spacing.lg,
  },
  incomeCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.success.main,
  },
  expenseCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.danger.main,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  netCard: {
    ...cardStyles.glass,
    marginTop: spacing.sm,
    borderWidth: 1,
  },
  netPositive: {
    borderColor: colors.success.main + '40',
    backgroundColor: colors.success.main + '10',
  },
  netNegative: {
    borderColor: colors.danger.main + '40',
    backgroundColor: colors.danger.main + '10',
  },
  netContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  netAmount: {
    fontSize: 28,
    fontWeight: '800',
  },
  netIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassCard: {
    ...cardStyles.glass,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
  },
  scorePercent: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  scoreInfo: {
    marginLeft: spacing.xl,
    flex: 1,
  },
  scoreTitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  scoreMessage: {
    fontSize: 14,
    color: colors.text.muted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 200,
    justifyContent: 'center',
  },
  fallbackChart: {
    width: '100%',
    padding: spacing.md,
  },
  categoryBar: {
    marginBottom: spacing.lg,
  },
  categoryBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  categoryBarContainer: {
    height: 8,
    backgroundColor: colors.background.primary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryPercent: {
    fontSize: 12,
    color: colors.text.muted,
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  trendItem: {
    alignItems: 'center',
    flex: 1,
  },
  trendBarContainer: {
    height: 100,
    width: 24,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  trendBar: {
    width: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
    minHeight: 4,
  },
  trendLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  trendValue: {
    fontSize: 9,
    color: colors.text.muted,
  },
  allocationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  allocationItem: {
    width: '50%',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  allocationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  allocationLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  allocationValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.muted,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.glow(colors.primary.main),
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
});
