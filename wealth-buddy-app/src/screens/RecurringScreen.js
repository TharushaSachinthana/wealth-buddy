import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { useApp } from '../context/AppContext-v2';

const RecurringScreen = () => {
  const { recurring, categories } = useApp();

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const totalRecurring = recurring.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>
            Monthly Recurring Expenses
          </Text>
          <Text variant="labelLarge" style={{ color: '#6200EE', marginBottom: 16 }}>
            Total: ${totalRecurring.toFixed(2)}/month
          </Text>

          {recurring && recurring.length > 0 ? (
            recurring.map((item) => (
              <View key={item.id} style={styles.recurringItem}>
                <View style={styles.itemLeft}>
                  <Text variant="labelMedium" style={{ fontWeight: '600' }}>
                    {item.name || getCategoryName(item.categoryId)}
                  </Text>
                  <Text variant="labelSmall" style={{ color: '#999', marginTop: 2 }}>
                    Category: {getCategoryName(item.categoryId)}
                  </Text>
                  <Text variant="labelSmall" style={{ color: '#999', marginTop: 2 }}>
                    Frequency: {item.frequency || 'monthly'}
                  </Text>
                </View>
                <Chip
                  icon="cash"
                  style={styles.amountChip}
                  textStyle={styles.amountText}
                >
                  ${item.amount?.toFixed(2)}
                </Chip>
              </View>
            ))
          ) : (
            <Text
              variant="labelMedium"
              style={{ textAlign: 'center', color: '#999', paddingVertical: 24 }}
            >
              No recurring expenses yet
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Summary Cards */}
      {recurring && recurring.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>
              Summary
            </Text>

            <View style={styles.summaryRow}>
              <Text variant="labelMedium">Total Recurring:</Text>
              <Text variant="labelMedium" style={{ fontWeight: 'bold', color: '#FF6B6B' }}>
                ${totalRecurring.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="labelMedium">Average per expense:</Text>
              <Text variant="labelMedium" style={{ fontWeight: 'bold' }}>
                ${(totalRecurring / recurring.length).toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="labelMedium">Number of recurring items:</Text>
              <Text variant="labelMedium" style={{ fontWeight: 'bold' }}>
                {recurring.length}
              </Text>
            </View>
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
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  recurringItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemLeft: {
    flex: 1,
  },
  amountChip: {
    backgroundColor: '#4ECDC4',
  },
  amountText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default RecurringScreen;
