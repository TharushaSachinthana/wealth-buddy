import React from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useApp } from '../context/AppContext-v2';
import * as db from '../core/db-v2';
import { generateMonthlyReportCSV, downloadCSV } from '../utils/csvExport';

export default function DashboardScreen() {
  const { user, allocation, goals, recurring, transactions, categories, currentMonth, loading } = useApp();

  // Calculate actual totals from transactions
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const netAmount = totalIncome - totalExpenses;
  const totalRecurring = recurring.reduce((sum, r) => sum + (r.amount || 0), 0);

  // Calculate actual allocation based on real income (from transactions or salary)
  const actualIncome = totalIncome > 0 ? totalIncome : (user?.salary || 0);
  const actualAllocation = user ? db.calculateAllocation({ ...user, salary: actualIncome }) : allocation;

  // Calculate savings score
  const calculateSavingsScore = () => {
    if (!user || actualIncome === 0) return { score: 'N/A', color: '#999', message: 'No data' };
    
    const expectedSavings = (actualIncome * (user.savingsPercent || 15)) / 100;
    const actualSavings = netAmount > 0 ? netAmount : 0;
    const savingsRatio = expectedSavings > 0 ? (actualSavings / expectedSavings) * 100 : 0;
    
    if (savingsRatio >= 100) return { score: 'Excellent', color: '#4ECDC4', message: 'Outstanding savings!' };
    if (savingsRatio >= 75) return { score: 'Good', color: '#95E1D3', message: 'Great job!' };
    if (savingsRatio >= 50) return { score: 'Fair', color: '#FFD93D', message: 'On track' };
    if (savingsRatio >= 25) return { score: 'Poor', color: '#FF6B6B', message: 'Need improvement' };
    return { score: 'Bad', color: '#C92A2A', message: 'Critical - review spending' };
  };

  const savingsScore = calculateSavingsScore();

  // Find maximum expense
  const expenseTransactions = transactions.filter(t => t.amount < 0);
  const maxExpense = expenseTransactions.length > 0 
    ? expenseTransactions.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max, expenseTransactions[0])
    : null;

  // Find maximum expensive day
  const expensesByDay = {};
  expenseTransactions.forEach(t => {
    const day = t.date;
    if (!expensesByDay[day]) expensesByDay[day] = 0;
    expensesByDay[day] += Math.abs(t.amount);
  });
  
  const maxExpensiveDay = Object.keys(expensesByDay).length > 0
    ? Object.entries(expensesByDay).reduce((max, [day, amount]) => 
        amount > max.amount ? { day, amount } : max, 
        { day: Object.keys(expensesByDay)[0], amount: expensesByDay[Object.keys(expensesByDay)[0]] }
      )
    : null;

  // Note: Goals will be updated manually or through a separate mechanism
  // Auto-updating goals based on transactions would require more complex logic

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
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Welcome, {user?.name || 'User'}!</Text>
        <Text style={styles.subtitle}>{monthString}</Text>
        {user && (
          <>
            <Text style={styles.text}>Monthly Salary: Rs. {(user.salary || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </>
        )}
      </View>

      {/* Actual Transactions Summary */}
      <View style={styles.section}>
        <Text style={styles.title}>This Month's Activity</Text>
        <Text style={styles.text}>
          Total Income: <Text style={styles.incomeText}>Rs. {totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </Text>
        <Text style={styles.text}>
          Total Expenses: <Text style={styles.expenseText}>Rs. {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </Text>
        <Text style={styles.text}>
          Net Amount: <Text style={[styles.netText, { color: netAmount >= 0 ? '#4ECDC4' : '#FF6B6B' }]}>
            Rs. {netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </Text>
        <Text style={styles.text}>Transactions: {transactions.length}</Text>
      </View>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.title}>Recent Transactions</Text>
          {transactions.slice(0, 5).map((t) => {
            const category = categories.find(c => c.id === t.categoryId);
            return (
              <View key={t.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionCategory}>{category?.name || 'Unknown'}</Text>
                  <Text style={styles.transactionDate}>{t.date}</Text>
                </View>
                <Text style={[styles.transactionAmount, { color: t.amount > 0 ? '#4ECDC4' : '#FF6B6B' }]}>
                  {t.amount > 0 ? '+' : ''}Rs. {Math.abs(t.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.title}>Monthly Allocation</Text>
        {actualAllocation && (
          <>
            <Text style={styles.text}>
              Essentials: Rs. {(actualAllocation.essentials || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.text}>
              Savings: Rs. {(actualAllocation.savings || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.text}>
              Discretionary: Rs. {(actualAllocation.discretionary || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.text}>
              Buffer: Rs. {(actualAllocation.buffer || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Recurring Expenses</Text>
        <Text style={styles.text}>Total: Rs. {totalRecurring.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        <Text style={styles.text}>Count: {recurring.length}</Text>
      </View>

      {/* Download Report Button */}
      <View style={styles.section}>
        <Button
          mode="contained"
          onPress={handleDownloadReport}
          icon="download"
          style={styles.downloadButton}
        >
          Download Monthly Report (CSV)
        </Button>
      </View>

      {/* Monthly Analysis */}
      <View style={styles.section}>
        <Text style={styles.title}>Monthly Analysis</Text>
        
        {/* Savings Score */}
        <View style={[styles.scoreCard, { backgroundColor: savingsScore.color + '20', borderLeftColor: savingsScore.color }]}>
          <Text style={styles.scoreLabel}>Savings Score</Text>
          <Text style={[styles.scoreValue, { color: savingsScore.color }]}>{savingsScore.score}</Text>
          <Text style={styles.scoreMessage}>{savingsScore.message}</Text>
        </View>

        {/* Maximum Expense */}
        {maxExpense && (
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Maximum Expense:</Text>
            <Text style={styles.analysisValue}>
              Rs. {Math.abs(maxExpense.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.analysisDetail}>
              {categories.find(c => c.id === maxExpense.categoryId)?.name || 'Unknown'} on {maxExpense.date}
            </Text>
          </View>
        )}

        {/* Maximum Expensive Day */}
        {maxExpensiveDay && (
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Most Expensive Day:</Text>
            <Text style={styles.analysisValue}>
              {new Date(maxExpensiveDay.day).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
            <Text style={styles.analysisDetail}>
              Total: Rs. {maxExpensiveDay.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Goals</Text>
        <Text style={styles.text}>Total Goals: {goals.length}</Text>
        {goals.map((goal) => {
          const progress = goal.target > 0 ? ((goal.current || 0) / goal.target) * 100 : 0;
          return (
            <View key={goal.id} style={styles.goalItem}>
              <Text style={styles.text}>
                {goal.name}: Rs. {(goal.current || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / Rs. {(goal.target || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.goalProgress}>Progress: {progress.toFixed(1)}%</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  incomeText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  expenseText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  netText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  goalProgress: {
    fontSize: 12,
    color: '#4ECDC4',
    marginTop: 2,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  scoreCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreMessage: {
    fontSize: 14,
    color: '#666',
  },
  analysisItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  analysisLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  analysisDetail: {
    fontSize: 12,
    color: '#666',
  },
  downloadButton: {
    marginVertical: 8,
  },
});
