import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Button,
  TextInput,
  SegmentedButtons,
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
          size={20}
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

const QuickAddScreen = () => {
  const { categories, addTransaction, currentMonth } = useApp();
  const navigation = useNavigation();
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
          navigation.navigate('Dashboard');
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
      {/* Amount Input Card */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Enter Amount</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>Rs.</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="flat"
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.text.muted}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={colors.text.primary}
            contentStyle={styles.amountInputContent}
          />
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
              size={24}
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
              size={24}
              color={type === 'income' ? colors.text.primary : colors.success.main}
            />
            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
              Income
            </Text>
          </TouchableOpacity>
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
                size={24}
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
            <MaterialCommunityIcons name="plus-circle" size={24} color={colors.text.primary} />
            <Text style={styles.addButtonText}>Add Transaction</Text>
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
                <MaterialCommunityIcons
                  name="check"
                  size={48}
                  color={colors.success.main}
                />
              </View>
              <Text style={styles.successTitle}>Success!</Text>
              <Text style={styles.successMessage}>Transaction added successfully</Text>
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
  amountCard: {
    ...cardStyles.glass,
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary.main + '40',
  },
  amountLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.text.muted,
    marginRight: spacing.sm,
  },
  amountInput: {
    backgroundColor: 'transparent',
    fontSize: 48,
    minWidth: 150,
  },
  amountInputContent: {
    fontSize: 48,
    fontWeight: '700',
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
    marginBottom: spacing.lg,
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
    padding: spacing.lg,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  typeTextActive: {
    color: colors.text.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  categoryButton: {
    width: '48%',
    margin: '1%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  categoryIconSelected: {
    backgroundColor: colors.primary.main,
  },
  categoryText: {
    fontSize: 13,
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
    padding: spacing.lg,
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
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.muted,
    marginTop: spacing.sm,
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
    fontSize: 18,
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

export default QuickAddScreen;
