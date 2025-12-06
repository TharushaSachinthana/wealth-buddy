import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, ProgressBar } from 'react-native-paper';

export default function DashboardScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setUser({
        name: 'John Doe',
        salary: 5000,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Hi, {user.name}!</Text>
          <Text variant="labelLarge" style={{ marginTop: 8 }}>
            Monthly Income: ${user.salary.toFixed(2)}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Monthly Allocation</Text>
          
          <View style={styles.row}>
            <Text variant="labelMedium">Essentials</Text>
            <Text variant="labelMedium">$2500.00</Text>
          </View>
          <ProgressBar progress={0.5} color="#FF6B6B" style={styles.progressBar} />

          <View style={styles.row}>
            <Text variant="labelMedium">Savings</Text>
            <Text variant="labelMedium">$750.00</Text>
          </View>
          <ProgressBar progress={0.15} color="#4ECDC4" style={styles.progressBar} />

          <View style={styles.row}>
            <Text variant="labelMedium">Discretionary</Text>
            <Text variant="labelMedium">$1500.00</Text>
          </View>
          <ProgressBar progress={0.3} color="#95E1D3" style={styles.progressBar} />

          <View style={styles.row}>
            <Text variant="labelMedium">Buffer</Text>
            <Text variant="labelMedium">$500.00</Text>
          </View>
          <ProgressBar progress={0.1} color="#FFD3B6" style={styles.progressBar} />
        </Card.Content>
      </Card>

      <Button mode="contained" style={styles.button}>
        View Details
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  card: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBar: {
    marginBottom: 16,
    height: 6,
  },
  button: {
    marginTop: 16,
  },
});
