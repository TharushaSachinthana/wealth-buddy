import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext-v2';

export default function GoalsScreen() {
  const { goals } = useApp();

  const totalTarget = goals.reduce((sum, g) => sum + (g.target || 0), 0);
  const totalCurrent = goals.reduce((sum, g) => sum + (g.current || 0), 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Savings Goals</Text>
        <Text style={styles.text}>
          Progress: ${totalCurrent.toFixed(2)} / ${totalTarget.toFixed(2)}
        </Text>
        <Text style={styles.text}>Goal Count: {goals.length}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Details</Text>
        {goals.map((goal) => {
          const percent = goal.target > 0 ? ((goal.current / goal.target) * 100).toFixed(0) : 0;
          return (
            <View key={goal.id} style={styles.goal}>
              <Text style={styles.goalName}>{goal.name}</Text>
              <Text style={styles.goalAmount}>
                ${goal.current || 0} / ${goal.target || 0}
              </Text>
              <Text style={styles.goalPercent}>{percent}%</Text>
              {goal.deadline && (
                <Text style={styles.goalDeadline}>Due: {goal.deadline}</Text>
              )}
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
    borderLeftColor: '#4ECDC4',
  },
  goalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  goalAmount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  goalPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginTop: 4,
  },
  goalDeadline: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
