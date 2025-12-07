import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext-v2';
// Conditionally import Victory charts
let VictoryPie, VictoryChart, VictoryBar, VictoryTheme;
try {
  const Victory = require('victory-native');
  VictoryPie = Victory.VictoryPie;
  VictoryChart = Victory.VictoryChart;
  VictoryBar = Victory.VictoryBar;
  VictoryTheme = Victory.VictoryTheme;
} catch (e) {
  console.warn('Victory charts not available, using fallback UI');
}

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

  // Prepare chart data
  const chartData = goals.map((goal, index) => ({
    x: goal.name.length > 10 ? goal.name.substring(0, 10) + '...' : goal.name,
    y: goal.target > 0 ? ((goal.current / goal.target) * 100) : 0,
    label: `${((goal.current / goal.target) * 100).toFixed(0)}%`,
  }));

  const pieData = goals.map((goal) => ({
    x: goal.name,
    y: goal.target,
    label: `${goal.name}\nRs. ${(goal.target || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
  }));

  return (
    <ScrollView style={styles.container}>
      {/* Overall Progress Card */}
      <View style={styles.glassCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <Text style={styles.progressAmount}>
              Rs. {totalCurrent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.progressTarget}>
              of Rs. {totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPercent}>{overallProgress.toFixed(0)}%</Text>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${Math.min(overallProgress, 100)}%` }]} />
        </View>
      </View>

      {/* Charts Section */}
      {goals.length > 0 && (
        <>
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Goals Progress</Text>
            <View style={styles.chartContainer}>
              {VictoryChart && VictoryBar ? (
                <VictoryChart
                  theme={VictoryTheme.material}
                  height={200}
                  padding={{ left: 50, right: 20, top: 20, bottom: 40 }}
                >
                  <VictoryBar
                    data={chartData}
                    style={{
                      data: {
                        fill: ({ datum }) => {
                          const progress = datum.y;
                          if (progress >= 75) return '#4ECDC4';
                          if (progress >= 50) return '#95E1D3';
                          if (progress >= 25) return '#FFD93D';
                          return '#FF6B6B';
                        },
                      },
                    }}
                    cornerRadius={{ top: 8 }}
                  />
                </VictoryChart>
              ) : (
                <View style={styles.fallbackChart}>
                  {goals.map((goal, index) => {
                    const progress = goal.target > 0 ? ((goal.current / goal.target) * 100) : 0;
                    const colors = ['#4ECDC4', '#95E1D3', '#FFD93D', '#FF6B6B'];
                    const color = progress >= 75 ? colors[0] : progress >= 50 ? colors[1] : progress >= 25 ? colors[2] : colors[3];
                    return (
                      <View key={goal.id} style={styles.goalProgressBar}>
                        <View style={styles.goalProgressHeader}>
                          <Text style={styles.goalProgressName}>{goal.name}</Text>
                          <Text style={styles.goalProgressPercent}>{progress.toFixed(0)}%</Text>
                        </View>
                        <View style={styles.goalProgressBarContainer}>
                          <View style={[styles.goalProgressBarFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Goals Distribution</Text>
            <View style={styles.chartContainer}>
              {VictoryPie ? (
                <VictoryPie
                  data={pieData}
                  height={250}
                  colorScale={['#4ECDC4', '#95E1D3', '#FFD93D', '#FF6B6B', '#F38181', '#C92A2A']}
                  style={{
                    labels: {
                      fontSize: 10,
                      fill: '#333',
                    },
                  }}
                />
              ) : (
                <View style={styles.fallbackChart}>
                  {goals.map((goal, index) => {
                    const percentage = totalTarget > 0 ? (goal.target / totalTarget) * 100 : 0;
                    const colors = ['#4ECDC4', '#95E1D3', '#FFD93D', '#FF6B6B', '#F38181', '#C92A2A'];
                    return (
                      <View key={goal.id} style={styles.goalDistributionItem}>
                        <View style={styles.goalDistributionHeader}>
                          <View style={[styles.goalDistributionColor, { backgroundColor: colors[index % colors.length] }]} />
                          <Text style={styles.goalDistributionName}>{goal.name}</Text>
                          <Text style={styles.goalDistributionAmount}>Rs. {goal.target.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
                        </View>
                        <View style={styles.goalDistributionBarContainer}>
                          <View style={[styles.goalDistributionBarFill, { width: `${percentage}%`, backgroundColor: colors[index % colors.length] }]} />
                        </View>
                        <Text style={styles.goalDistributionPercent}>{percentage.toFixed(1)}% of total</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </>
      )}

      {/* Goals List */}
      <View style={styles.glassCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Goals ({goals.length})</Text>
          <Button
            mode="contained"
            onPress={() => setNewGoalVisible(true)}
            icon="plus"
            style={styles.addButton}
            labelStyle={styles.addButtonLabel}
          >
            Add Goal
          </Button>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="target" size={64} color="#999" />
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySubtext}>Add your first savings goal to get started!</Text>
          </View>
        ) : (
          goals.map((goal) => {
            const progress = goal.target > 0 ? ((goal.current / goal.target) * 100) : 0;
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalAmount}>
                      Rs. {(goal.current || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / Rs. {(goal.target || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={styles.goalActions}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleEditGoal(goal)}
                      iconColor="#6200EE"
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleDeleteGoal(goal.id)}
                      iconColor="#FF6B6B"
                    />
                  </View>
                </View>
                <View style={styles.goalProgressContainer}>
                  <View style={[styles.goalProgressBar, { width: `${Math.min(progress, 100)}%` }]} />
                </View>
                <View style={styles.goalFooter}>
                  <Text style={styles.goalPercent}>{progress.toFixed(1)}% Complete</Text>
                  {goal.deadline && (
                    <Text style={styles.goalDeadline}>
                      {daysLeft !== null && daysLeft >= 0
                        ? `${daysLeft} days left`
                        : 'Deadline passed'}
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Add Goal Dialog */}
      <Portal>
        <Dialog
          visible={Boolean(newGoalVisible)}
          onDismiss={() => setNewGoalVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Add New Goal</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Goal Name"
              value={goalName}
              onChangeText={setGoalName}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Target Amount (Rs.)"
              value={goalTarget}
              onChangeText={setGoalTarget}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
              left={<TextInput.Affix text="Rs." />}
            />
            <TextInput
              label="Current Amount (Rs.) - Optional"
              value={goalCurrent}
              onChangeText={setGoalCurrent}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
              left={<TextInput.Affix text="Rs." />}
            />
            <TextInput
              label="Deadline (YYYY-MM-DD) - Optional"
              value={goalDeadline}
              onChangeText={setGoalDeadline}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="2024-12-31"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNewGoalVisible(false)}>Cancel</Button>
            <Button onPress={handleAddGoal} loading={Boolean(loading)} disabled={Boolean(loading)}>
              Add
            </Button>
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
          <Dialog.Title>Edit Goal</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Goal Name"
              value={goalName}
              onChangeText={setGoalName}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Target Amount (Rs.)"
              value={goalTarget}
              onChangeText={setGoalTarget}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
              left={<TextInput.Affix text="Rs." />}
            />
            <TextInput
              label="Current Amount (Rs.)"
              value={goalCurrent}
              onChangeText={setGoalCurrent}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
              left={<TextInput.Affix text="Rs." />}
            />
            <TextInput
              label="Deadline (YYYY-MM-DD) - Optional"
              value={goalDeadline}
              onChangeText={setGoalDeadline}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="2024-12-31"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditGoalVisible(false)}>Cancel</Button>
            <Button onPress={handleUpdateGoal} loading={Boolean(loading)} disabled={Boolean(loading)}>
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  progressTarget: {
    fontSize: 14,
    color: '#999',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    borderRadius: 12,
  },
  addButtonLabel: {
    fontSize: 12,
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 8,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 14,
    color: '#666',
  },
  goalActions: {
    flexDirection: 'row',
  },
  goalProgressContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalProgressBar: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  goalDeadline: {
    fontSize: 12,
    color: '#999',
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
  fallbackChart: {
    width: '100%',
    padding: 16,
  },
  goalProgressBar: {
    marginBottom: 16,
  },
  goalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalProgressName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  goalProgressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  goalProgressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalDistributionItem: {
    marginBottom: 16,
  },
  goalDistributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalDistributionColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  goalDistributionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  goalDistributionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  goalDistributionBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  goalDistributionBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalDistributionPercent: {
    fontSize: 12,
    color: '#999',
  },
});
