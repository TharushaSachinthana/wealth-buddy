import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Dialog, Portal, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext-v2';
import { colors, spacing, borderRadius, shadows, cardStyles } from '../theme';

export default function GoalsScreen() {
  const { goals, saveGoal, deleteGoal } = useApp();
  const [newGoalVisible, setNewGoalVisible] = useState(false);
  const [editGoalVisible, setEditGoalVisible] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  const [loading, setLoading] = useState(false);

  const totalTarget = goals.reduce((sum, g) => sum + (g.target || 0), 0);
  const totalCurrent = goals.reduce((sum, g) => sum + (g.current || 0), 0);
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  const handleAddGoal = async () => {
    if (!goalName || !goalTarget) {
      Alert.alert('Error', 'Please enter goal name and target amount');
      return;
    }

    setLoading(true);
    try {
      const success = await saveGoal(
        null,
        goalName,
        parseFloat(goalTarget),
        parseFloat(goalCurrent || 0),
        goalDeadline
      );

      if (success) {
        setNewGoalVisible(false);
        setGoalName('');
        setGoalTarget('');
        setGoalCurrent('');
        setGoalDeadline('');
        Alert.alert('Success', 'Goal added successfully!');
      } else {
        Alert.alert('Error', 'Failed to add goal');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setGoalTarget(goal.target.toString());
    setGoalCurrent(goal.current.toString());
    setGoalDeadline(goal.deadline || '');
    setEditGoalVisible(true);
  };

  const handleUpdateGoal = async () => {
    if (!goalName || !goalTarget) {
      Alert.alert('Error', 'Please enter goal name and target amount');
      return;
    }

    setLoading(true);
    try {
      const success = await saveGoal(
        editingGoal.id,
        goalName,
        parseFloat(goalTarget),
        parseFloat(goalCurrent || 0),
        goalDeadline
      );

      if (success) {
        setEditGoalVisible(false);
        setEditingGoal(null);
        setGoalName('');
        setGoalTarget('');
        setGoalCurrent('');
        setGoalDeadline('');
        Alert.alert('Success', 'Goal updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update goal');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteGoal(goalId);
            if (success) {
              Alert.alert('Success', 'Goal deleted successfully!');
            }
          },
        },
      ]
    );
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return colors.success.main;
    if (progress >= 75) return colors.success.light;
    if (progress >= 50) return colors.warning.main;
    if (progress >= 25) return colors.warning.light;
    return colors.danger.main;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Overall Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <Text style={styles.progressAmount}>
              Rs. {totalCurrent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
            <Text style={styles.progressTarget}>
              of Rs. {totalTarget.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} target
            </Text>
          </View>
          <View style={styles.progressRing}>
            <View style={[styles.progressRingFill, { borderColor: getProgressColor(overallProgress) }]}>
              <Text style={[styles.progressPercent, { color: getProgressColor(overallProgress) }]}>
                {overallProgress.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min(overallProgress, 100)}%`, backgroundColor: getProgressColor(overallProgress) }
            ]}
          />
        </View>
      </View>

      {/* Goals Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.warning.main + '20' }]}>
            <MaterialCommunityIcons name="trophy" size={20} color={colors.warning.main} />
          </View>
          <Text style={styles.summaryValue}>{goals.length}</Text>
          <Text style={styles.summaryLabel}>Total Goals</Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.success.main + '20' }]}>
            <MaterialCommunityIcons name="check-circle" size={20} color={colors.success.main} />
          </View>
          <Text style={styles.summaryValue}>{goals.filter(g => (g.current / g.target) >= 1).length}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.primary.main + '20' }]}>
            <MaterialCommunityIcons name="progress-check" size={20} color={colors.primary.main} />
          </View>
          <Text style={styles.summaryValue}>{goals.filter(g => (g.current / g.target) < 1).length}</Text>
          <Text style={styles.summaryLabel}>In Progress</Text>
        </View>
      </View>

      {/* Goals List Header */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Your Goals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setNewGoalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.text.primary} />
          <Text style={styles.addButtonText}>Add Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Goals List */}
      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons name="trophy-outline" size={48} color={colors.text.muted} />
          </View>
          <Text style={styles.emptyTitle}>No Goals Yet</Text>
          <Text style={styles.emptySubtitle}>Set your first savings goal to start tracking your progress!</Text>
        </View>
      ) : (
        goals.map((goal) => {
          const progress = goal.target > 0 ? ((goal.current / goal.target) * 100) : 0;
          const progressColor = getProgressColor(progress);
          const daysLeft = goal.deadline
            ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
            : null;
          const isCompleted = progress >= 100;

          return (
            <View key={goal.id} style={[styles.goalCard, isCompleted && styles.goalCardCompleted]}>
              <View style={styles.goalHeader}>
                <View style={styles.goalLeft}>
                  <View style={[styles.goalIcon, { backgroundColor: progressColor + '20' }]}>
                    <MaterialCommunityIcons
                      name={isCompleted ? 'trophy' : 'target'}
                      size={22}
                      color={progressColor}
                    />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalAmount}>
                      Rs. {(goal.current || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      <Text style={styles.goalAmountTotal}> / Rs. {(goal.target || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.goalActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditGoal(goal)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="pencil" size={18} color={colors.primary.main} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteGoal(goal.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="delete" size={18} color={colors.danger.main} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.goalProgressContainer}>
                <View style={[styles.goalProgressBar, { width: `${Math.min(progress, 100)}%`, backgroundColor: progressColor }]} />
              </View>

              <View style={styles.goalFooter}>
                <View style={[styles.percentBadge, { backgroundColor: progressColor + '20' }]}>
                  <Text style={[styles.percentText, { color: progressColor }]}>
                    {progress.toFixed(0)}%
                  </Text>
                </View>
                {goal.deadline && (
                  <View style={styles.deadlineContainer}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={14}
                      color={daysLeft !== null && daysLeft < 7 ? colors.danger.main : colors.text.muted}
                    />
                    <Text style={[
                      styles.deadlineText,
                      daysLeft !== null && daysLeft < 7 && { color: colors.danger.main }
                    ]}>
                      {daysLeft !== null && daysLeft >= 0
                        ? `${daysLeft} days left`
                        : 'Deadline passed'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 32 }} />

      {/* Add Goal Dialog */}
      <Portal>
        <Dialog
          visible={Boolean(newGoalVisible)}
          onDismiss={() => setNewGoalVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Add New Goal</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Goal Name"
              value={goalName}
              onChangeText={setGoalName}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="e.g., Emergency Fund, Vacation"
              placeholderTextColor={colors.text.muted}
              outlineColor={colors.border.light}
              activeOutlineColor={colors.primary.main}
              textColor={colors.text.primary}
              contentStyle={{ backgroundColor: colors.background.tertiary }}
            />
            <TextInput
              label="Target Amount (Rs.)"
              value={goalTarget}
              onChangeText={setGoalTarget}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
              left={<TextInput.Affix text="Rs." textStyle={{ color: colors.text.muted }} />}
              outlineColor={colors.border.light}
              activeOutlineColor={colors.primary.main}
              textColor={colors.text.primary}
              contentStyle={{ backgroundColor: colors.background.tertiary }}
            />
            <TextInput
              label="Current Amount (Rs.) - Optional"
              value={goalCurrent}
              onChangeText={setGoalCurrent}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
              left={<TextInput.Affix text="Rs." textStyle={{ color: colors.text.muted }} />}
              outlineColor={colors.border.light}
              activeOutlineColor={colors.primary.main}
              textColor={colors.text.primary}
              contentStyle={{ backgroundColor: colors.background.tertiary }}
            />
            <TextInput
              label="Deadline (YYYY-MM-DD) - Optional"
              value={goalDeadline}
              onChangeText={setGoalDeadline}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="2024-12-31"
              placeholderTextColor={colors.text.muted}
              outlineColor={colors.border.light}
              activeOutlineColor={colors.primary.main}
              textColor={colors.text.primary}
              contentStyle={{ backgroundColor: colors.background.tertiary }}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setNewGoalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
              onPress={handleAddGoal}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>{loading ? 'Adding...' : 'Add Goal'}</Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Goal Dialog */}
      <Portal>
        <Dialog
          visible={Boolean(editGoalVisible)}
          onDismiss={() => setEditGoalVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Edit Goal</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Goal Name"
              value={goalName}
              onChangeText={setGoalName}
              mode="outlined"
              style={styles.dialogInput}
              outlineColor={colors.border.light}
              activeOutlineColor={colors.primary.main}
              textColor={colors.text.primary}
              contentStyle={{ backgroundColor: colors.background.tertiary }}
            />
            <TextInput
              label="Target Amount (Rs.)"
              value={goalTarget}
              onChangeText={setGoalTarget}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
              left={<TextInput.Affix text="Rs." textStyle={{ color: colors.text.muted }} />}
              outlineColor={colors.border.light}
              activeOutlineColor={colors.primary.main}
              textColor={colors.text.primary}
              contentStyle={{ backgroundColor: colors.background.tertiary }}
            />
            <TextInput
              label="Current Amount (Rs.)"
              value={goalCurrent}
              onChangeText={setGoalCurrent}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
              left={<TextInput.Affix text="Rs." textStyle={{ color: colors.text.muted }} />}
              outlineColor={colors.border.light}
              activeOutlineColor={colors.primary.main}
              textColor={colors.text.primary}
              contentStyle={{ backgroundColor: colors.background.tertiary }}
            />
            <TextInput
              label="Deadline (YYYY-MM-DD) - Optional"
              value={goalDeadline}
              onChangeText={setGoalDeadline}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="2024-12-31"
              placeholderTextColor={colors.text.muted}
              outlineColor={colors.border.light}
              activeOutlineColor={colors.primary.main}
              textColor={colors.text.primary}
              contentStyle={{ backgroundColor: colors.background.tertiary }}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditGoalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
              onPress={handleUpdateGoal}
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
  progressCard: {
    ...cardStyles.glass,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning.main + '40',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  progressAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.warning.main,
    marginBottom: 4,
  },
  progressTarget: {
    fontSize: 14,
    color: colors.text.muted,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.tertiary,
    padding: 4,
  },
  progressRingFill: {
    flex: 1,
    borderRadius: 38,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '800',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.background.primary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  summaryItem: {
    flex: 1,
    ...cardStyles.glass,
    padding: spacing.md,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.text.muted,
    textAlign: 'center',
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
    backgroundColor: colors.warning.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
    ...shadows.sm,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse,
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
    paddingHorizontal: spacing.xl,
  },
  goalCard: {
    ...cardStyles.glass,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  goalCardCompleted: {
    borderWidth: 1,
    borderColor: colors.success.main + '50',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  goalLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  goalAmountTotal: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text.muted,
  },
  goalActions: {
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
  goalProgressContainer: {
    height: 8,
    backgroundColor: colors.background.primary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  goalProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  dialog: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xxl,
  },
  dialogTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  dialogInput: {
    marginBottom: spacing.md,
    backgroundColor: colors.background.tertiary,
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
    backgroundColor: colors.warning.main,
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
    color: colors.text.inverse,
  },
});
