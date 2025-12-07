import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Alert } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, IconButton, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext-v2';
import * as db from '../core/db-v2';

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

  return (
    <ScrollView style={styles.container}>
      {/* Summary Card */}
      <View style={styles.glassCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.summaryLabel}>Total Monthly Recurring</Text>
            <Text style={styles.summaryAmount}>
              Rs. {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.summarySubtext}>
              {recurring.length} expense{recurring.length !== 1 ? 's' : ''} • Avg: Rs. {average.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.summaryIcon}>
            <MaterialCommunityIcons name="repeat" size={48} color="#6200EE" />
          </View>
        </View>
      </View>

      {/* Recurring Expenses List */}
      <View style={styles.glassCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recurring Expenses ({recurring.length})</Text>
          <Button
            mode="contained"
            onPress={() => setNewRecurringVisible(true)}
            icon="plus"
            style={styles.addButton}
            labelStyle={styles.addButtonLabel}
          >
            Add
          </Button>
        </View>

        {recurring.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="repeat" size={64} color="#999" />
            <Text style={styles.emptyText}>No recurring expenses yet</Text>
            <Text style={styles.emptySubtext}>Add your first recurring expense to track monthly bills!</Text>
          </View>
        ) : (
          recurring.map((item) => {
            const category = categories.find(c => c.id === item.categoryId);
            return (
              <View key={item.id} style={styles.recurringCard}>
                <View style={styles.recurringHeader}>
                  <View style={styles.recurringLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: '#6200EE20' }]}>
                      <MaterialCommunityIcons
                        name={getCategoryIcon(item.categoryId)}
                        size={24}
                        color="#6200EE"
                      />
                    </View>
                    <View style={styles.recurringInfo}>
                      <Text style={styles.recurringName}>{item.name}</Text>
                      <Text style={styles.recurringCategory}>{getCategoryName(item.categoryId)}</Text>
                      <View style={styles.recurringMeta}>
                        <MaterialCommunityIcons name="calendar-repeat" size={14} color="#999" />
                        <Text style={styles.recurringFrequency}>{item.frequency || 'monthly'}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.recurringRight}>
                    <Text style={styles.recurringAmount}>
                      Rs. {(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <View style={styles.recurringActions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => handleEditRecurring(item)}
                        iconColor="#6200EE"
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDeleteRecurring(item.id)}
                        iconColor="#FF6B6B"
                      />
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Add Recurring Dialog */}
      <Portal>
        <Dialog
          visible={Boolean(newRecurringVisible)}
          onDismiss={() => setNewRecurringVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Add Recurring Expense</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Expense Name"
              value={recurringName}
              onChangeText={setRecurringName}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="e.g., Rent, Internet Bill"
            />
            <TextInput
              label="Amount (Rs.)"
              value={recurringAmount}
              onChangeText={setRecurringAmount}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
              left={<TextInput.Affix text="Rs." />}
            />
            <Text variant="labelMedium" style={{ marginTop: 8, marginBottom: 8 }}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {expenseCategories.map((cat) => (
                <CategoryButton
                  key={cat.id}
                  category={cat}
                  selected={Boolean(selectedCategory && Number(selectedCategory.id) === Number(cat.id))}
                  onPress={() => setSelectedCategory(cat)}
                />
              ))}
            </ScrollView>
            <Text variant="labelMedium" style={{ marginTop: 16, marginBottom: 8 }}>
              Frequency
            </Text>
            <SegmentedButtons
              value={recurringFrequency}
              onValueChange={setRecurringFrequency}
              buttons={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              style={styles.segmented}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNewRecurringVisible(false)}>Cancel</Button>
            <Button onPress={handleAddRecurring} loading={Boolean(loading)} disabled={Boolean(loading)}>
              Add
            </Button>
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
          <Dialog.Title>Edit Recurring Expense</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Expense Name"
              value={recurringName}
              onChangeText={setRecurringName}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Amount (Rs.)"
              value={recurringAmount}
              onChangeText={setRecurringAmount}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
              left={<TextInput.Affix text="Rs." />}
            />
            <Text variant="labelMedium" style={{ marginTop: 8, marginBottom: 8 }}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {expenseCategories.map((cat) => (
                <CategoryButton
                  key={cat.id}
                  category={cat}
                  selected={Boolean(selectedCategory && Number(selectedCategory.id) === Number(cat.id))}
                  onPress={() => setSelectedCategory(cat)}
                />
              ))}
            </ScrollView>
            <Text variant="labelMedium" style={{ marginTop: 16, marginBottom: 8 }}>
              Frequency
            </Text>
            <SegmentedButtons
              value={recurringFrequency}
              onValueChange={setRecurringFrequency}
              buttons={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              style={styles.segmented}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditRecurringVisible(false)}>Cancel</Button>
            <Button onPress={handleUpdateRecurring} loading={Boolean(loading)} disabled={Boolean(loading)}>
              Update
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#999',
  },
  summaryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6200EE20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    borderRadius: 12,
  },
  addButtonLabel: {
    fontSize: 12,
  },
  recurringCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recurringLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recurringInfo: {
    flex: 1,
  },
  recurringName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recurringCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  recurringMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recurringFrequency: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  recurringRight: {
    alignItems: 'flex-end',
  },
  recurringAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
  },
  recurringActions: {
    flexDirection: 'row',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  dialog: {
    borderRadius: 20,
  },
  dialogInput: {
    marginBottom: 12,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonContent: {
    height: 36,
  },
  segmented: {
    marginBottom: 12,
  },
});
