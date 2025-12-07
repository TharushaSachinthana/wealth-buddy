import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Dialog, Portal, IconButton, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext-v2';
import * as db from '../core/db-v2';
import { colors, spacing, borderRadius, shadows, cardStyles } from '../theme';

const CategoryButton = ({ category, selected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.dialogCategoryButton, selected && styles.dialogCategorySelected]}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={category.icon || 'tag'}
        size={18}
        color={selected ? colors.text.primary : colors.text.secondary}
      />
      <Text style={[styles.dialogCategoryText, selected && styles.dialogCategoryTextSelected]}>
        {category.name || 'Category'}
      </Text>
    </TouchableOpacity>
  );
};

export default function RecurringScreen() {
  const { recurring, categories, addRecurring, deleteRecurring, loadAll } = useApp();
  const [newRecurringVisible, setNewRecurringVisible] = useState(false);
  const [editRecurringVisible, setEditRecurringVisible] = useState(false);
  const [recurringName, setRecurringName] = useState('');
  const [recurringAmount, setRecurringAmount] = useState('');
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [loading, setLoading] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const total = recurring.reduce((sum, r) => sum + (r.amount || 0), 0);
  const average = recurring.length > 0 ? total / recurring.length : 0;

  const handleAddRecurring = async () => {
    if (!recurringName || !recurringAmount || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const success = await addRecurring(
        selectedCategory.id,
        parseFloat(recurringAmount),
        recurringFrequency,
        recurringName
      );

      if (success) {
        setNewRecurringVisible(false);
        setRecurringName('');
        setRecurringAmount('');
        setSelectedCategory(null);
        setRecurringFrequency('monthly');
        Alert.alert('Success', 'Recurring expense added successfully!');
      } else {
        Alert.alert('Error', 'Failed to add recurring expense');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecurring = (item) => {
    setEditingRecurring(item);
    setRecurringName(item.name);
    setRecurringAmount(item.amount.toString());
    setRecurringFrequency(item.frequency || 'monthly');
    const category = categories.find(c => c.id === item.categoryId);
    setSelectedCategory(category);
    setEditRecurringVisible(true);
  };

  const handleUpdateRecurring = async () => {
    if (!recurringName || !recurringAmount || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const success = await db.updateRecurring(
        editingRecurring.id,
        selectedCategory.id,
        parseFloat(recurringAmount),
        recurringFrequency,
        recurringName
      );

      if (success) {
        await loadAll();
        setEditRecurringVisible(false);
        setEditingRecurring(null);
        setRecurringName('');
        setRecurringAmount('');
        setSelectedCategory(null);
        setRecurringFrequency('monthly');
        Alert.alert('Success', 'Recurring expense updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update recurring expense');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecurring = async (id) => {
    Alert.alert(
      'Delete Recurring Expense',
      'Are you sure you want to delete this recurring expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteRecurring(id);
            if (success) {
              Alert.alert('Success', 'Recurring expense deleted successfully!');
            }
          },
        },
      ]
    );
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => Number(c.id) === Number(categoryId));
    return cat ? cat.name : 'Unknown';
  };

  const getCategoryIcon = (categoryId) => {
    const cat = categories.find((c) => Number(c.id) === Number(categoryId));
    return cat ? cat.icon : 'help-circle';
  };

  const getFrequencyColor = (freq) => {
    switch (freq) {
      case 'daily': return colors.danger.main;
      case 'weekly': return colors.warning.main;
      case 'monthly': return colors.primary.main;
      case 'yearly': return colors.success.main;
      default: return colors.text.muted;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <View>
            <Text style={styles.summaryLabel}>Total Monthly Recurring</Text>
            <Text style={styles.summaryAmount}>
              Rs. {total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
            <Text style={styles.summarySubtext}>
              {recurring.length} expense{recurring.length !== 1 ? 's' : ''} • Avg: Rs. {average.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={styles.summaryIconContainer}>
            <MaterialCommunityIcons name="repeat" size={32} color={colors.accent.purple} />
          </View>
        </View>
      </View>

      {/* List Header */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Recurring Expenses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setNewRecurringVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.text.primary} />
          <Text style={styles.addButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Recurring List */}
      {recurring.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons name="repeat-off" size={48} color={colors.text.muted} />
          </View>
          <Text style={styles.emptyTitle}>No Recurring Expenses</Text>
          <Text style={styles.emptySubtitle}>Add your bills and subscriptions to track monthly costs</Text>
        </View>
      ) : (
        recurring.map((item) => (
          <View key={item.id} style={styles.recurringCard}>
            <View style={styles.recurringTop}>
              <View style={styles.recurringLeft}>
                <View style={[styles.categoryIconContainer, { backgroundColor: colors.accent.purple + '20' }]}>
                  <MaterialCommunityIcons
                    name={getCategoryIcon(item.categoryId)}
                    size={22}
                    color={colors.accent.purple}
                  />
                </View>
                <View style={styles.recurringInfo}>
                  <Text style={styles.recurringName}>{item.name}</Text>
                  <Text style={styles.recurringCategory}>{getCategoryName(item.categoryId)}</Text>
                </View>
              </View>
              <Text style={styles.recurringAmount}>
                Rs. {(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Text>
            </View>

            <View style={styles.recurringBottom}>
              <View style={[styles.frequencyBadge, { backgroundColor: getFrequencyColor(item.frequency) + '20' }]}>
                <MaterialCommunityIcons
                  name="calendar-repeat"
                  size={14}
                  color={getFrequencyColor(item.frequency)}
                />
                <Text style={[styles.frequencyText, { color: getFrequencyColor(item.frequency) }]}>
                  {item.frequency || 'monthly'}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditRecurring(item)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="pencil" size={18} color={colors.primary.main} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteRecurring(item.id)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="delete" size={18} color={colors.danger.main} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 32 }} />

      {/* Add Recurring Dialog */}
      <Portal>
        <Dialog
          visible={Boolean(newRecurringVisible)}
          onDismiss={() => setNewRecurringVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Add Recurring Expense</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              <TextInput
                label="Expense Name"
                value={recurringName}
                onChangeText={setRecurringName}
                mode="outlined"
                style={styles.dialogInput}
                placeholder="e.g., Rent, Internet Bill"
                placeholderTextColor={colors.text.muted}
                outlineColor={colors.border.light}
                activeOutlineColor={colors.primary.main}
                textColor={colors.text.primary}
                contentStyle={{ backgroundColor: colors.background.tertiary }}
              />
              <TextInput
                label="Amount (Rs.)"
                value={recurringAmount}
                onChangeText={setRecurringAmount}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.dialogInput}
                left={<TextInput.Affix text="Rs." textStyle={{ color: colors.text.muted }} />}
                outlineColor={colors.border.light}
                activeOutlineColor={colors.primary.main}
                textColor={colors.text.primary}
                contentStyle={{ backgroundColor: colors.background.tertiary }}
              />

              <Text style={styles.dialogLabel}>Category</Text>
              <View style={styles.dialogCategoryGrid}>
                {expenseCategories.map((cat) => (
                  <CategoryButton
                    key={cat.id}
                    category={cat}
                    selected={Boolean(selectedCategory && Number(selectedCategory.id) === Number(cat.id))}
                    onPress={() => setSelectedCategory(cat)}
                  />
                ))}
              </View>

              <Text style={styles.dialogLabel}>Frequency</Text>
              <View style={styles.frequencyGrid}>
                {['daily', 'weekly', 'monthly', 'yearly'].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[styles.frequencyOption, recurringFrequency === freq && styles.frequencyOptionSelected]}
                    onPress={() => setRecurringFrequency(freq)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.frequencyOptionText, recurringFrequency === freq && styles.frequencyOptionTextSelected]}>
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions style={styles.dialogActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setNewRecurringVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
              onPress={handleAddRecurring}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>{loading ? 'Adding...' : 'Add'}</Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Recurring Dialog */}
      <Portal>
        <Dialog
          visible={Boolean(editRecurringVisible)}
          onDismiss={() => setEditRecurringVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Edit Recurring Expense</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              <TextInput
                label="Expense Name"
                value={recurringName}
                onChangeText={setRecurringName}
                mode="outlined"
                style={styles.dialogInput}
                outlineColor={colors.border.light}
                activeOutlineColor={colors.primary.main}
                textColor={colors.text.primary}
                contentStyle={{ backgroundColor: colors.background.tertiary }}
              />
              <TextInput
                label="Amount (Rs.)"
                value={recurringAmount}
                onChangeText={setRecurringAmount}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.dialogInput}
                left={<TextInput.Affix text="Rs." textStyle={{ color: colors.text.muted }} />}
                outlineColor={colors.border.light}
                activeOutlineColor={colors.primary.main}
                textColor={colors.text.primary}
                contentStyle={{ backgroundColor: colors.background.tertiary }}
              />

              <Text style={styles.dialogLabel}>Category</Text>
              <View style={styles.dialogCategoryGrid}>
                {expenseCategories.map((cat) => (
                  <CategoryButton
                    key={cat.id}
                    category={cat}
                    selected={Boolean(selectedCategory && Number(selectedCategory.id) === Number(cat.id))}
                    onPress={() => setSelectedCategory(cat)}
                  />
                ))}
              </View>

              <Text style={styles.dialogLabel}>Frequency</Text>
              <View style={styles.frequencyGrid}>
                {['daily', 'weekly', 'monthly', 'yearly'].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[styles.frequencyOption, recurringFrequency === freq && styles.frequencyOptionSelected]}
                    onPress={() => setRecurringFrequency(freq)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.frequencyOptionText, recurringFrequency === freq && styles.frequencyOptionTextSelected]}>
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions style={styles.dialogActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditRecurringVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
              onPress={handleUpdateRecurring}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>{loading ? 'Updating...' : 'Update'}</Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
  },
  summaryCard: {
    ...cardStyles.glass,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.purple,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.accent.purple,
    marginBottom: spacing.xs,
  },
  summarySubtext: {
    fontSize: 12,
    color: colors.text.muted,
  },
  summaryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent.purple + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
    ...shadows.sm,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  emptyState: {
    ...cardStyles.glass,
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
  recurringCard: {
    ...cardStyles.glass,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  recurringTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  recurringLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  recurringInfo: {
    flex: 1,
  },
  recurringName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  recurringCategory: {
    fontSize: 12,
    color: colors.text.muted,
  },
  recurringAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent.purple,
  },
  recurringBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xxl,
    maxHeight: '80%',
  },
  dialogTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  dialogScrollArea: {
    paddingHorizontal: spacing.xl,
    maxHeight: 400,
  },
  dialogInput: {
    marginBottom: spacing.md,
    backgroundColor: colors.background.tertiary,
  },
  dialogLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  dialogCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  dialogCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    margin: 4,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.xs,
  },
  dialogCategorySelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '20',
  },
  dialogCategoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  dialogCategoryTextSelected: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  frequencyOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  frequencyOptionSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '20',
  },
  frequencyOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  frequencyOptionTextSelected: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  dialogActions: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.muted,
  },
  confirmButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
});
