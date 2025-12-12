import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity, Dimensions, Platform, Animated } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext-v2';
import * as db from '../core/db-v2';
import { generateMonthlyReportCSV, downloadCSV } from '../utils/csvExport';
import { colors, spacing, borderRadius, shadows, typography, cardStyles } from '../theme';
import Logo from '../components/Logo';

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

export default function DashboardScreen() {
  const { user, allocation, goals, recurring, transactions, categories, currentMonth, loading, navigateMonth } = useApp();
  const [animatedBalance, setAnimatedBalance] = useState(0);

  // Calculate actual totals from transactions
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const netAmount = totalIncome - totalExpenses;

  // Animated counter effect
  useEffect(() => {
    let start = 0;
    const end = netAmount;
    const duration = 1500;
    const steps = 60;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setAnimatedBalance(end);
        clearInterval(timer);
      } else {
        setAnimatedBalance(start);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [netAmount]);

  // Calculate savings score
  const calculateSavingsScore = () => {
    const actualIncome = totalIncome > 0 ? totalIncome : (user?.salary || 0);
    if (!user || actualIncome === 0) return { score: 'N/A', color: colors.text.muted, message: 'No data', percent: 0 };

    const savingsRatio = totalIncome > 0 ? (netAmount / totalIncome) * 100 : 0;

    if (savingsRatio >= 50) return { score: 'Excellent', color: colors.newDesign.green, message: 'Outstanding!', icon: 'trophy', percent: savingsRatio };
    if (savingsRatio >= 30) return { score: 'Good', color: colors.newDesign.cyan, message: 'Great job!', icon: 'check-circle', percent: savingsRatio };
    if (savingsRatio >= 10) return { score: 'Fair', color: colors.newDesign.purple, message: 'On track', icon: 'alert-circle', percent: savingsRatio };
    return { score: 'Low', color: colors.newDesign.red, message: 'Needs attention', icon: 'alert', percent: savingsRatio };
  };

  const savingsScore = calculateSavingsScore();

  // Find expenses by category
  const expensesByCategory = {};
  transactions
    .filter(t => t.amount < 0)
    .forEach(t => {
      const category = categories.find(c => c.id === t.categoryId);
      const catName = category?.name || 'Other';
      if (!expensesByCategory[catName]) expensesByCategory[catName] = 0;
      expensesByCategory[catName] += Math.abs(t.amount);
    });

  const pieData = Object.entries(expensesByCategory).map(([name, amount]) => ({
    x: name,
    y: amount,
    label: name
  }));

  // Daily spending trend (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayExpenses = transactions
      .filter(t => t.amount < 0 && t.date === dateStr)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    last7Days.push({
      x: date.toLocaleDateString('en-US', { weekday: 'short' }),
      y: dayExpenses,
    });
  }

  const monthString = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <LinearGradient
                colors={colors.gradients.button}
                style={styles.settingsGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="cog" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.monthSelector}>
            <IconButton icon="chevron-left" iconColor="white" size={20} onPress={() => navigateMonth(-1)} />
            <Text style={styles.monthText}>{monthString}</Text>
            <IconButton icon="chevron-right" iconColor="white" size={20} onPress={() => navigateMonth(1)} />
          </View>
        </View>

        {/* Summary Cards Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.trendRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.newDesign.green + '20' }]}>
                <MaterialCommunityIcons name="trending-up" size={16} color={colors.newDesign.green} />
              </View>
              <Text style={styles.summaryLabel}>Income</Text>
            </View>
            <Text style={[styles.summaryValue, { color: colors.newDesign.green }]}>
              Rs. {totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.trendRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.newDesign.red + '20' }]}>
                <MaterialCommunityIcons name="trending-down" size={16} color={colors.newDesign.red} />
              </View>
              <Text style={styles.summaryLabel}>Expenses</Text>
            </View>
            <Text style={[styles.summaryValue, { color: colors.newDesign.red }]}>
              Rs. {totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>

        {/* Net Balance Hero Card */}
        <LinearGradient
          colors={colors.gradients.balance}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Net Balance</Text>
            <MaterialCommunityIcons
              name={netAmount >= 0 ? "arrow-top-right" : "arrow-bottom-right"}
              size={24}
              color={netAmount >= 0 ? colors.newDesign.green : colors.newDesign.red}
            />
          </View>

          <Text style={styles.balanceAmount}>
            Rs. {Math.abs(animatedBalance).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>

          <Text style={[styles.balanceIndicator, { color: netAmount >= 0 ? colors.newDesign.green : colors.newDesign.red }]}>
            {netAmount >= 0 ? '↑' : '↓'} {totalIncome > 0 ? ((Math.abs(netAmount) / totalIncome) * 100).toFixed(1) : 0}% this month
          </Text>
        </LinearGradient>

        {/* Savings Score */}
        <View style={styles.glassCard}>
          <View style={styles.scoreRow}>
            <View>
              <Text style={styles.cardTitle}>Financial Health</Text>
              <Text style={[styles.scoreMessage, { color: savingsScore.color }]}>
                {savingsScore.icon === 'trophy' ? '🎉 ' : ''}{savingsScore.message}
              </Text>
            </View>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreText, { color: savingsScore.color }]}>{savingsScore.percent.toFixed(0)}%</Text>
            </View>
          </View>
        </View>

        {/* Charts Section */}
        {pieData.length > 0 && (
          <View style={styles.glassCard}>
            <Text style={styles.cardTitle}>Expense Breakdown</Text>

            {VictoryPie ? (
              <View style={{ alignItems: 'center', marginTop: -20, marginBottom: -20 }}>
                <VictoryPie
                  data={pieData}
                  width={300}
                  height={300}
                  innerRadius={60}
                  padAngle={2}
                  colorScale={[colors.newDesign.cyan, colors.newDesign.purple, colors.newDesign.pink, colors.newDesign.green, colors.newDesign.red]}
                  style={{ labels: { fill: 'white', fontSize: 10 } }}
                />
              </View>
            ) : (
              <View style={styles.fallbackChart}>
                {pieData.map((item, index) => (
                  <View key={index} style={styles.chartRow}>
                    <Text style={styles.chartLabel}>{item.x}</Text>
                    <Text style={styles.chartValue}>Rs. {item.y}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Quick Stats Grid */}
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.newDesign.cyan }]}>{transactions.length}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.newDesign.purple }]}>{recurring.length}</Text>
              <Text style={styles.statLabel}>Bills</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.newDesign.pink }]}>{goals.length}</Text>
              <Text style={styles.statLabel}>Goals</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1624',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  settingsGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    minWidth: 120,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  balanceCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -1,
  },
  balanceIndicator: {
    fontSize: 14,
    fontWeight: '500',
  },
  glassCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreMessage: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  // Fallback chart styles
  fallbackChart: {
    gap: 8,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  chartLabel: {
    color: '#fff',
  },
  chartValue: {
    color: '#fff',
    fontWeight: '600',
  }
});
