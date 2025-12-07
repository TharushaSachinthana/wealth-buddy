import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useApp } from '../context/AppContext-v2';

export default function RecurringScreen() {
  const { recurring } = useApp();

  const total = recurring.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Recurring Expenses</Text>
        <Text style={styles.text}>Total: Rs. {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        <Text style={styles.text}>Count: {recurring.length}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Details</Text>
        {recurring.map((item) => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemAmount}>Rs. {(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text style={styles.itemFreq}>{item.frequency}</Text>
          </View>
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
  item: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE',
    marginTop: 4,
  },
  itemFreq: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
