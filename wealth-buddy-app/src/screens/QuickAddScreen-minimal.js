import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext-v2';

export default function QuickAddScreen() {
  const { categories } = useApp();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Quick Add Transaction</Text>
        <Text style={styles.subtitle}>Coming soon...</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Categories ({categories.length})</Text>
        {categories.map((cat) => (
          <Text key={cat.id} style={styles.text}>
            • {cat.name} ({cat.type})
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
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
