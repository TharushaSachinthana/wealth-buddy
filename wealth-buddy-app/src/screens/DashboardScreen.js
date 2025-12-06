import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Text, Button, ProgressBar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext-v2';

const DashboardScreen = () => {
  const {
    user,
    allocation,
    goals,
    recurring,
    currentMonth,
    navigateMonth,
    loading,
  } = useApp();

  if (Boolean(loading)) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  const monthString = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const totalRecurring = recurring.reduce((sum, r) => sum + (r.amount || 0), 0);
  const allocatedTotal = user?.salary || 0;

  // Calculate percentages
  const essentialsPercent = allocation
    ? ((allocation.essentials || 0) / allocatedTotal) * 100
    : 0;
  const savingsPercent = allocation
    ? ((allocation.savings || 0) / allocatedTotal) * 100
    : 0;
  const discretionaryPercent = allocation
    ? ((allocation.discretionary || 0) / allocatedTotal) * 100
    : 0;
  const bufferPercent = allocation
    ? ((allocation.buffer || 0) / allocatedTotal) * 100
    : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <Button icon="chevron-left" onPress={() => navigateMonth(-1)} />
        <Text variant="headlineSmall" style={styles.monthText}>
          {monthString}
        </Text>
        <Button icon="chevron-right" onPress={() => navigateMonth(1)} />
      </View>

      {/* User Info */}
      {user && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Hi, {user.name}!</Text>
            <Text variant="labelLarge" style={{ marginTop: 8 }}>
              Monthly Income: ${user.salary?.toFixed(2)}
            </Text>
            <Text variant="labelSmall" style={{ color: '#666', marginTop: 4 }}>
              Recurring: ${totalRecurring.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Allocation Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>
            Monthly Allocation
          </Text>

          {/* Essentials */}
          <View style={styles.allocationRow}>
            <View style={styles.allocationLeft}>
              <MaterialCommunityIcons name="home" size={24} color="#FF6B6B" />
              <Text variant="labelMedium" style={{ marginLeft: 8 }}>
                Essentials
              </Text>
            </View>
            <Text variant="labelMedium">
              ${(allocation?.essentials || 0).toFixed(2)}
            </Text>
          </View>
          <ProgressBar
            progress={Math.max(0, Math.min(1, Number(essentialsPercent) / 100))}
            color="#FF6B6B"
            style={styles.progressBar}
          />

          {/* Savings */}
          <View style={styles.allocationRow}>
            <View style={styles.allocationLeft}>
              <MaterialCommunityIcons
                name="piggy-bank"
                size={24}
                color="#4ECDC4"
              />
              <Text variant="labelMedium" style={{ marginLeft: 8 }}>
                Savings
              </Text>
            </View>
            <Text variant="labelMedium">
              ${(allocation?.savings || 0).toFixed(2)}
            </Text>
          </View>
          <ProgressBar
            progress={Math.max(0, Math.min(1, Number(savingsPercent) / 100))}
            color="#4ECDC4"
            style={styles.progressBar}
          />

          {/* Discretionary */}
          <View style={styles.allocationRow}>
            <View style={styles.allocationLeft}>
              <MaterialCommunityIcons
                name="shopping"
                size={24}
                color="#95E1D3"
              />
              <Text variant="labelMedium" style={{ marginLeft: 8 }}>
                Discretionary
              </Text>
            </View>
            <Text variant="labelMedium">
              ${(allocation?.discretionary || 0).toFixed(2)}
            </Text>
          </View>
          <ProgressBar
            progress={Math.max(0, Math.min(1, Number(discretionaryPercent) / 100))}
            color="#95E1D3"
            style={styles.progressBar}
          />

          {/* Buffer */}
          <View style={styles.allocationRow}>
            <View style={styles.allocationLeft}>
              <MaterialCommunityIcons
                name="shield-check"
                size={24}
                color="#F38181"
              />
              <Text variant="labelMedium" style={{ marginLeft: 8 }}>
                Buffer
              </Text>
            </View>
            <Text variant="labelMedium">
              ${(allocation?.buffer || 0).toFixed(2)}
            </Text>
          </View>
          <ProgressBar
            progress={Math.max(0, Math.min(1, Number(bufferPercent) / 100))}
            color="#F38181"
            style={styles.progressBar}
          />
        </Card.Content>
      </Card>

      {/* Top Goals */}
      {goals && goals.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>
              Top Goals
            </Text>
            {goals.slice(0, 3).map((goal) => {
              const progress = goal.target > 0 ? goal.current / goal.target : 0;
              return (
                <View key={goal.id} style={styles.goalItem}>
                  <Text variant="labelMedium">{goal.name}</Text>
                  <Text variant="labelSmall" style={{ color: '#666' }}>
                    ${goal.current?.toFixed(2)} / ${goal.target?.toFixed(2)}
                  </Text>
                  <ProgressBar
                    progress={Math.max(0, Math.min(1, Number(progress) || 0))}
                    color="#6200EE"
                    style={styles.goalProgress}
                  />
                </View>
              );
            })}
          </Card.Content>
        </Card>
      )}

      {/* Recurring Expenses */}
      {recurring && recurring.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>
              Active Recurring ({recurring.length})
            </Text>
            {recurring.map((r) => (
              <View key={r.id} style={styles.recurringItem}>
                <Text variant="labelMedium">{r.name || 'Expense'}</Text>
                <Chip>${r.amount?.toFixed(2)}</Chip>
              </View>
            ))}
            <Text
              variant="labelLarge"
              style={{
                marginTop: 12,
                fontWeight: 'bold',
                color: '#6200EE',
              }}
            >
              Total Recurring: ${totalRecurring.toFixed(2)}/month
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  monthText: {
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  allocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  allocationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    marginBottom: 12,
    height: 6,
  },
  goalItem: {
    marginBottom: 12,
  },
  goalProgress: {
    marginTop: 4,
    height: 4,
  },
  recurringItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default DashboardScreen;
