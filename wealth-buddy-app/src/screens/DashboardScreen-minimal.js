import React from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useApp } from '../context/AppContext-v2';

export default function DashboardScreen() {
  const { user, allocation, goals, recurring, loading } = useApp();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const totalRecurring = recurring.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Welcome!</Text>
        {user && (
          <>
            <Text style={styles.text}>Name: {user.name}</Text>
            <Text style={styles.text}>Salary: ${(user.salary || 0).toFixed(2)}</Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Monthly Allocation</Text>
        {allocation && (
          <>
            <Text style={styles.text}>
              Essentials: ${(allocation.essentials || 0).toFixed(2)}
            </Text>
            <Text style={styles.text}>
              Savings: ${(allocation.savings || 0).toFixed(2)}
            </Text>
            <Text style={styles.text}>
              Discretionary: ${(allocation.discretionary || 0).toFixed(2)}
            </Text>
            <Text style={styles.text}>
              Buffer: ${(allocation.buffer || 0).toFixed(2)}
            </Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Recurring Expenses</Text>
        <Text style={styles.text}>Total: ${totalRecurring.toFixed(2)}</Text>
        <Text style={styles.text}>Count: {recurring.length}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Goals</Text>
        <Text style={styles.text}>Total Goals: {goals.length}</Text>
        {goals.map((goal) => (
          <Text key={goal.id} style={styles.text}>
            {goal.name}: ${goal.current || 0} / ${goal.target || 0}
          </Text>
        ))}
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
  text: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
});
