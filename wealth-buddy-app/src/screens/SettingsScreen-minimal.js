import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext-v2';

export default function SettingsScreen() {
  const { user, goals } = useApp();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Profile Settings</Text>
        {user && (
          <>
            <Text style={styles.text}>Name: {user.name}</Text>
            <Text style={styles.text}>Monthly Salary: Rs. {(user.salary || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text style={styles.text}>Savings %: {user.savingsPercent || 0}%</Text>
            <Text style={styles.text}>Buffer %: {user.bufferPercent || 0}%</Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Your Goals ({goals.length})</Text>
        {goals.map((goal) => (
          <View key={goal.id} style={styles.goal}>
            <Text style={styles.goalName}>{goal.name}</Text>
            <Text style={styles.goalAmount}>Target: Rs. {(goal.target || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>App Info</Text>
        <Text style={styles.text}>Wealth Buddy v1.0.0</Text>
        <Text style={styles.text}>Personal Finance Manager</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  goal: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
  },
  goalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  goalAmount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
