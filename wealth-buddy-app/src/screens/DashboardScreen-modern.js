import React from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext-v2';
import * as db from '../core/db-v2';
import { generateMonthlyReportCSV, downloadCSV } from '../utils/csvExport';

// Conditionally import Victory charts - only if react-native-svg is available
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
    if (!user || actualIncome === 0) return { score: 'N/A', color: '#999', message: 'No data', icon: 'help-circle' };
    
    const expectedSavings = (actualIncome * (user.savingsPercent || 15)) / 100;
    const actualSavings = netAmount > 0 ? netAmount : 0;
    const savingsRatio = expectedSavings > 0 ? (actualSavings / expectedSavings) * 100 : 0;
    
    if (savingsRatio >= 100) return { score: 'Excellent', color: '#4ECDC4', message: 'Outstanding!', icon: 'trophy' };
    if (savingsRatio >= 75) return { score: 'Good', color: '#95E1D3', message: 'Great job!', icon: 'check-circle' };
    if (savingsRatio >= 50) return { score: 'Fair', color: '#FFD93D', message: 'On track', icon: 'alert-circle' };
    if (savingsRatio >= 25) return { score: 'Poor', color: '#FF6B6B', message: 'Need improvement', icon: 'alert' };
    return { score: 'Bad', color: '#C92A2A', message: 'Critical', icon: 'alert-octagon' };
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
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading...</Text>
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
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <View style={styles.monthNav}>
            <IconButton
              icon="chevron-left"
              size={24}
              iconColor="#fff"
              onPress={() => navigateMonth(-1)}
            />
            <Text style={styles.monthText}>{monthString}</Text>
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor="#fff"
              onPress={() => navigateMonth(1)}
            />
          </View>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#4ECDC4' }]}>
          <MaterialCommunityIcons name="arrow-up" size={24} color="#fff" />
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={styles.summaryAmount}>
            Rs. {totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FF6B6B' }]}>
          <MaterialCommunityIcons name="arrow-down" size={24} color="#fff" />
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={styles.summaryAmount}>
            Rs. {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: netAmount >= 0 ? '#95E1D3' : '#F38181', flex: 1 }]}>
          <MaterialCommunityIcons name={netAmount >= 0 ? 'trending-up' : 'trending-down'} size={24} color="#fff" />
          <Text style={styles.summaryLabel}>Net</Text>
          <Text style={styles.summaryAmount}>
            Rs. {Math.abs(netAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
        </View>
      </View>

      {/* Savings Score Card */}
      <View style={styles.glassCard}>
        <View style={styles.scoreHeader}>
          <MaterialCommunityIcons name={savingsScore.icon} size={32} color={savingsScore.color} />
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreLabel}>Savings Score</Text>
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
                  height={250}
                  colorScale={['#4ECDC4', '#95E1D3', '#FFD93D', '#FF6B6B', '#F38181', '#C92A2A', '#6200EE']}
                  style={{
                    labels: {
                      fontSize: 10,
                      fill: '#333',
                    },
                  }}
                  labelRadius={({ innerRadius }) => innerRadius + 30}
                />
              ) : (
                <View style={styles.fallbackChart}>
                  {Object.entries(expensesByCategory).map(([name, amount], index) => {
                    const percentage = (amount / totalExpenses) * 100;
                    const colors = ['#4ECDC4', '#95E1D3', '#FFD93D', '#FF6B6B', '#F38181', '#C92A2A', '#6200EE'];
                    return (
                      <View key={name} style={styles.categoryBar}>
                        <View style={styles.categoryBarHeader}>
                          <Text style={styles.categoryName}>{name}</Text>
                          <Text style={styles.categoryAmount}>Rs. {amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
                        </View>
                        <View style={styles.categoryBarContainer}>
                          <View style={[styles.categoryBarFill, { width: `${percentage}%`, backgroundColor: colors[index % colors.length] }]} />
                        </View>
                        <Text style={styles.categoryPercent}>{percentage.toFixed(1)}%</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {categoryChartData.length > 0 && (
            <View style={styles.glassCard}>
              <Text style={styles.sectionTitle}>Category Breakdown</Text>
              <View style={styles.chartContainer}>
                {VictoryChart && VictoryBar ? (
                  <VictoryChart
                    theme={VictoryTheme.material}
                    height={200}
                    padding={{ left: 60, right: 20, top: 20, bottom: 40 }}
                  >
                    <VictoryAxis
                      style={{
                        axis: { stroke: '#999' },
                        tickLabels: { fill: '#666', fontSize: 10 },
                      }}
                    />
                    <VictoryAxis
                      dependentAxis
                      style={{
                        axis: { stroke: '#999' },
                        tickLabels: { fill: '#666', fontSize: 10 },
                      }}
                    />
                    <VictoryBar
                      data={categoryChartData}
                      style={{
                        data: {
                          fill: '#4ECDC4',
                        },
                      }}
                      cornerRadius={{ top: 8 }}
                    />
                  </VictoryChart>
                ) : (
                  <View style={styles.fallbackChart}>
                    {categoryChartData.map((item, index) => {
                      const maxValue = Math.max(...categoryChartData.map(d => d.y));
                      const barHeight = (item.y / maxValue) * 150;
                      return (
                        <View key={item.x} style={styles.barChartItem}>
                          <View style={styles.barContainer}>
                            <View style={[styles.bar, { height: barHeight, backgroundColor: '#4ECDC4' }]} />
                          </View>
                          <Text style={styles.barLabel}>{item.x}</Text>
                          <Text style={styles.barValue}>Rs. {(item.y / 1000).toFixed(1)}k</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}

          {last7Days.some(d => d.y > 0) && (
            <View style={styles.glassCard}>
              <Text style={styles.sectionTitle}>7-Day Spending Trend</Text>
              <View style={styles.chartContainer}>
                {VictoryChart && VictoryLine ? (
                  <VictoryChart
                    theme={VictoryTheme.material}
                    height={200}
                    padding={{ left: 50, right: 20, top: 20, bottom: 40 }}
                  >
                    <VictoryAxis
                      style={{
                        axis: { stroke: '#999' },
                        tickLabels: { fill: '#666', fontSize: 10 },
                      }}
                    />
                    <VictoryAxis
                      dependentAxis
                      style={{
                        axis: { stroke: '#999' },
                        tickLabels: { fill: '#666', fontSize: 10 },
                      }}
                    />
                    <VictoryLine
                      data={last7Days}
                      style={{
                        data: {
                          stroke: '#4ECDC4',
                          strokeWidth: 3,
                        },
                      }}
                      animate={{
                        duration: 1000,
                        onLoad: { duration: 1000 },
                      }}
                    />
                  </VictoryChart>
                ) : (
                  <View style={styles.fallbackChart}>
                    <View style={styles.lineChartContainer}>
                      {last7Days.map((day, index) => {
                        const maxValue = Math.max(...last7Days.map(d => d.y));
                        const height = maxValue > 0 ? (day.y / maxValue) * 150 : 0;
                        return (
                          <View key={index} style={styles.lineChartItem}>
                            <View style={[styles.lineChartBar, { height: height || 5, backgroundColor: '#4ECDC4' }]} />
                            <Text style={styles.lineChartLabel}>{day.x}</Text>
                            <Text style={styles.lineChartValue}>Rs. {day.y.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
                          </View>
                        );
                      })}
                    </View>
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
          <View style={styles.chartContainer}>
            {VictoryChart && VictoryBar ? (
              <VictoryChart
                theme={VictoryTheme.material}
                height={200}
                padding={{ left: 60, right: 20, top: 20, bottom: 40 }}
              >
                <VictoryAxis
                  style={{
                    axis: { stroke: '#999' },
                    tickLabels: { fill: '#666', fontSize: 10 },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  style={{
                    axis: { stroke: '#999' },
                    tickLabels: { fill: '#666', fontSize: 10 },
                  }}
                />
                <VictoryBar
                  data={allocationData}
                  style={{
                    data: {
                      fill: ({ datum }) => {
                        if (datum.x === 'Essentials') return '#FF6B6B';
                        if (datum.x === 'Savings') return '#4ECDC4';
                        if (datum.x === 'Discretionary') return '#95E1D3';
                        return '#FFD93D';
                      },
                    },
                  }}
                  cornerRadius={{ top: 8 }}
                />
              </VictoryChart>
            ) : (
              <View style={styles.fallbackChart}>
                {allocationData.map((item, index) => {
                  const maxValue = Math.max(...allocationData.map(d => d.y));
                  const barHeight = maxValue > 0 ? (item.y / maxValue) * 150 : 0;
                  const colors = { 'Essentials': '#FF6B6B', 'Savings': '#4ECDC4', 'Discretionary': '#95E1D3', 'Buffer': '#FFD93D' };
                  return (
                    <View key={item.x} style={styles.barChartItem}>
                      <View style={styles.barContainer}>
                        <View style={[styles.bar, { height: barHeight, backgroundColor: colors[item.x] || '#4ECDC4' }]} />
                      </View>
                      <Text style={styles.barLabel}>{item.x}</Text>
                      <Text style={styles.barValue}>Rs. {item.y.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.glassCard}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="wallet" size={24} color="#4ECDC4" />
            <Text style={styles.statValue}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="repeat" size={24} color="#95E1D3" />
            <Text style={styles.statValue}>{recurring.length}</Text>
            <Text style={styles.statLabel}>Recurring</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="target" size={24} color="#FFD93D" />
            <Text style={styles.statValue}>{goals.length}</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
        </View>
      </View>

      {/* Download Button */}
      <View style={styles.glassCard}>
        <Button
          mode="contained"
          onPress={handleDownloadReport}
          icon="download"
          style={styles.downloadButton}
          labelStyle={styles.downloadButtonLabel}
        >
          Download Monthly Report
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreInfo: {
    marginLeft: 16,
    flex: 1,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreMessage: {
    fontSize: 14,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 8,
    minHeight: 200,
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  downloadButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  downloadButtonLabel: {
    fontSize: 14,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  fallbackChart: {
    width: '100%',
    padding: 16,
  },
  categoryBar: {
    marginBottom: 16,
  },
  categoryBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
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
    color: '#999',
  },
  barChartItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  barContainer: {
    height: 150,
    width: 40,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#999',
  },
  lineChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
  },
  lineChartItem: {
    alignItems: 'center',
    flex: 1,
  },
  lineChartBar: {
    width: 30,
    borderRadius: 4,
    marginBottom: 8,
    minHeight: 4,
  },
  lineChartLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  lineChartValue: {
    fontSize: 9,
    color: '#999',
  },
});

