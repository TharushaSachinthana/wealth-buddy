import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Button,
  TextInput,
  SegmentedButtons,
  Dialog,
  Portal,
  Text,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext-v2';

const CategoryButton = ({ category, selected, onPress }) => {
  return (
    <Button
      mode={selected === true ? 'contained' : 'outlined'}
      onPress={onPress}
      style={styles.categoryButton}
      contentStyle={styles.categoryButtonContent}
      icon={category.icon || undefined}
    >
      {category.name || 'Category'}
    </Button>
  );
};

const QuickAddScreen = () => {
  const { categories, addTransaction, currentMonth } = useApp();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [method, setMethod] = useState('card');
  const [notes, setNotes] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleAddTransaction = async () => {
    if (!amount || parseFloat(amount) === 0) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setLoading(true);
    try {
      const transactionAmount = type === 'expense' ? -parseFloat(amount) : parseFloat(amount);
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const success = await addTransaction(
        selectedCategory.id,
        transactionAmount,
        dateString,
        method,
        notes
      );

      if (success) {
        setVisible(true);
        setTimeout(() => {
          setVisible(false);
          setAmount('');
          setSelectedCategory(null);
          setNotes('');
          setMethod('card');
        }, 1500);
      } else {
        Alert.alert('Error', 'Failed to add transaction');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>
            Add Transaction
          </Text>

          {/* Type Selection */}
          <Text variant="labelMedium" style={{ marginBottom: 8 }}>
            Type
          </Text>
          <SegmentedButtons
            value={type}
            onValueChange={setType}
            buttons={[
              { value: 'expense', label: 'Expense', icon: 'minus-circle' },
              { value: 'income', label: 'Income', icon: 'plus-circle' },
            ]}
            style={styles.segmented}
          />

          {/* Amount Input */}
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Affix text="Rs." />}
            placeholder="0.00"
          />

          {/* Category Selection */}
          <Text variant="labelMedium" style={{ marginTop: 16, marginBottom: 8 }}>
            Category
          </Text>
          <View style={styles.categoryGrid}>
            {filteredCategories.map((cat) => (
              <CategoryButton
                key={cat.id}
                category={cat}
                selected={Boolean(selectedCategory && Number(selectedCategory.id) === Number(cat.id))}
                onPress={() => setSelectedCategory(cat)}
              />
            ))}
          </View>

          {/* Payment Method */}
          <Text variant="labelMedium" style={{ marginTop: 16, marginBottom: 8 }}>
            Payment Method
          </Text>
          <SegmentedButtons
            value={method}
            onValueChange={setMethod}
            buttons={[
              { value: 'card', label: 'Card', icon: 'credit-card' },
              { value: 'cash', label: 'Cash', icon: 'cash' },
              { value: 'bank', label: 'Bank', icon: 'bank' },
            ]}
            style={styles.segmented}
          />

          {/* Notes */}
          <TextInput
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            style={styles.input}
            multiline={true}
            numberOfLines={2}
          />

          {/* Add Button */}
          <Button
            mode="contained"
            onPress={handleAddTransaction}
            style={styles.addButton}
            loading={Boolean(loading)}
            disabled={Boolean(loading)}
          >
            Add Transaction
          </Button>
        </Card.Content>
      </Card>

      {/* Success Dialog */}
      <Portal>
        <Dialog visible={Boolean(visible)} onDismiss={() => setVisible(false)}>
          <Dialog.Content>
            <View style={styles.dialogContent}>
              <MaterialCommunityIcons
                name="check-circle"
                size={48}
                color="#4ECDC4"
              />
              <Text
                variant="titleMedium"
                style={{ marginTop: 12, textAlign: 'center' }}
              >
                Transaction Added!
              </Text>
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>
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
  input: {
    marginTop: 8,
    marginBottom: 12,
  },
  segmented: {
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '48%',
    marginBottom: 8,
  },
  categoryButtonContent: {
    height: 40,
  },
  addButton: {
    marginTop: 16,
    paddingVertical: 6,
  },
  dialogContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});

export default QuickAddScreen;
