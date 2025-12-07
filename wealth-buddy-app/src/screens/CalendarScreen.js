import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
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

const CalendarScreen = () => {
  const { categories, addTransaction, currentMonth } = useApp();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [method, setMethod] = useState('card');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  // Generate calendar days for current month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  const calendarDays = [];
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({ day, date: dateStr });
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleAddTransaction = async () => {
    if (!amount || parseFloat(amount) === 0) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    setLoading(true);
    try {
      const transactionAmount = type === 'expense' ? -parseFloat(amount) : parseFloat(amount);

      const success = await addTransaction(
        selectedCategory.id,
        transactionAmount,
        selectedDate,
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
            Add Transaction on Specific Date
          </Text>

          {/* Date Selection */}
          <Text variant="labelMedium" style={{ marginBottom: 8 }}>
            Select Date
          </Text>
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            icon="calendar"
            style={styles.dateButton}
          >
            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'Select Date'}
          </Button>

          {/* Calendar Grid */}
          {showDatePicker && (
            <View style={styles.calendarContainer}>
              <Text variant="labelMedium" style={{ marginBottom: 8, textAlign: 'center' }}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <View style={styles.calendarGrid}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <View key={day} style={styles.calendarHeader}>
                    <Text style={styles.calendarHeaderText}>{day}</Text>
                  </View>
                ))}
                {calendarDays.map((dayData, index) => (
                  <Button
                    key={index}
                    mode={dayData && selectedDate === dayData.date ? 'contained' : 'outlined'}
                    onPress={() => dayData && handleDateSelect(dayData.date)}
                    style={styles.calendarDay}
                    disabled={!dayData}
                    compact
                  >
                    {dayData ? dayData.day : ''}
                  </Button>
                ))}
              </View>
            </View>
          )}

          {/* Type Selection */}
          <Text variant="labelMedium" style={{ marginTop: 16, marginBottom: 8 }}>
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
  dateButton: {
    marginBottom: 12,
  },
  calendarContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarHeader: {
    width: '14.28%',
    padding: 8,
    alignItems: 'center',
  },
  calendarHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarDay: {
    width: '14.28%',
    minWidth: 40,
    margin: 2,
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

export default CalendarScreen;

