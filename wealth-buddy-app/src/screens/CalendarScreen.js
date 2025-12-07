import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import {
  Button,
  TextInput,
  Dialog,
  Portal,
  Text,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext-v2';
import { colors, spacing, borderRadius, shadows, cardStyles } from '../theme';

const CategoryButton = ({ category, selected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.categoryButton,
        selected && styles.categoryButtonSelected,
      ]}
      activeOpacity={0.7}
    >
      <View style={[
        styles.categoryIcon,
        selected && styles.categoryIconSelected,
      ]}>
        <MaterialCommunityIcons
          name={category.icon || 'tag'}
          size={18}
          color={selected ? colors.text.primary : colors.text.secondary}
        />
      </View>
      <Text style={[
        styles.categoryText,
        selected && styles.categoryTextSelected,
      ]}>
        {category.name || 'Category'}
      </Text>
    </TouchableOpacity>
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
  const [showDatePicker, setShowDatePicker] = useState(true);

  const filteredCategories = categories.filter((c) => c.type === type);

  // Generate calendar days for current month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date().toISOString().split('T')[0];

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({ day, date: dateStr });
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date);
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Calendar Card */}
      <View style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>

        {/* Week Headers */}
        <View style={styles.weekHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <View key={day} style={styles.weekDay}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((dayData, index) => {
            const isSelected = dayData && selectedDate === dayData.date;
            const isToday = dayData && dayData.date === today;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  !dayData && styles.calendarDayEmpty,
                  isToday && styles.calendarDayToday,
                  isSelected && styles.calendarDaySelected,
                ]}
                onPress={() => dayData && handleDateSelect(dayData.date)}
                disabled={!dayData}
                activeOpacity={0.7}
              >
                {dayData && (
                  <Text style={[
                    styles.calendarDayText,
                    isToday && styles.calendarDayTextToday,
                    isSelected && styles.calendarDayTextSelected,
                  ]}>
                    {dayData.day}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Date Display */}
        <View style={styles.selectedDateContainer}>
          <MaterialCommunityIcons name="calendar-check" size={20} color={colors.primary.main} />
          <Text style={styles.selectedDateText}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
      </View>

      {/* Type Selection */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Transaction Type</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonExpense]}
            onPress={() => setType('expense')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-down-circle"
              size={22}
              color={type === 'expense' ? colors.text.primary : colors.danger.main}
            />
            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.typeButtonIncome]}
            onPress={() => setType('income')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-up-circle"
              size={22}
              color={type === 'income' ? colors.text.primary : colors.success.main}
            />
            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Amount</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencyLabel}>Rs.</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.text.muted}
            outlineColor={colors.border.light}
            activeOutlineColor={colors.primary.main}
            textColor={colors.text.primary}
            contentStyle={{ backgroundColor: colors.background.tertiary }}
          />
        </View>
      </View>

      {/* Category Selection */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Category</Text>
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
      </View>

      {/* Payment Method */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.methodContainer}>
          {[
            { value: 'card', label: 'Card', icon: 'credit-card' },
            { value: 'cash', label: 'Cash', icon: 'cash' },
            { value: 'bank', label: 'Bank', icon: 'bank' },
          ].map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.methodButton,
                method === item.value && styles.methodButtonSelected,
              ]}
              onPress={() => setMethod(item.value)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={22}
                color={method === item.value ? colors.primary.main : colors.text.muted}
              />
              <Text style={[
                styles.methodText,
                method === item.value && styles.methodTextSelected,
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notes (optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          style={styles.notesInput}
          placeholder="Add a note..."
          placeholderTextColor={colors.text.muted}
          multiline={true}
          numberOfLines={2}
          outlineColor={colors.border.light}
          activeOutlineColor={colors.primary.main}
          textColor={colors.text.primary}
          contentStyle={{ backgroundColor: colors.background.tertiary }}
        />
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, loading && styles.addButtonDisabled]}
        onPress={handleAddTransaction}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading ? (
          <Text style={styles.addButtonText}>Adding...</Text>
        ) : (
          <>
            <MaterialCommunityIcons name="calendar-plus" size={22} color={colors.text.primary} />
            <Text style={styles.addButtonText}>Add to Calendar</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 32 }} />

      {/* Success Dialog */}
      <Portal>
        <Dialog visible={Boolean(visible)} onDismiss={() => setVisible(false)} style={styles.dialog}>
          <Dialog.Content>
            <View style={styles.dialogContent}>
              <View style={styles.successIcon}>
                <MaterialCommunityIcons name="check" size={48} color={colors.success.main} />
              </View>
              <Text style={styles.successTitle}>Success!</Text>
              <Text style={styles.successMessage}>Transaction added for selected date</Text>
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
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
  },
  calendarCard: {
    ...cardStyles.glass,
    marginBottom: spacing.lg,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  calendarDayEmpty: {
    opacity: 0,
  },
  calendarDayToday: {
    backgroundColor: colors.primary.main + '30',
    borderRadius: borderRadius.round,
  },
  calendarDaySelected: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.round,
    ...shadows.glow(colors.primary.main),
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  calendarDayTextToday: {
    color: colors.primary.main,
    fontWeight: '700',
  },
  calendarDayTextSelected: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.sm,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  card: {
    ...cardStyles.glass,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.sm,
  },
  typeButtonExpense: {
    backgroundColor: colors.danger.main,
    borderColor: colors.danger.main,
  },
  typeButtonIncome: {
    backgroundColor: colors.success.main,
    borderColor: colors.success.main,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  typeTextActive: {
    color: colors.text.primary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.muted,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  categoryButton: {
    width: '48%',
    margin: '1%',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary.main + '20',
    borderColor: colors.primary.main,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  categoryIconSelected: {
    backgroundColor: colors.primary.main,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
    flex: 1,
  },
  categoryTextSelected: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  methodContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  methodButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodButtonSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '15',
  },
  methodText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  methodTextSelected: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.glow(colors.primary.main),
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  dialog: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xxl,
  },
  dialogContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  successMessage: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default CalendarScreen;
