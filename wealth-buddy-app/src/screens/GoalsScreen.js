import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Card,
  Text,
  Button,
  ProgressBar,
  Dialog,
  Portal,
  TextInput,
  Alert,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext-v2';

const GoalsScreen = () => {
  const { goals, deleteGoal, saveGoal } = useApp();
  const [newGoalVisible, setNewGoalVisible] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddGoal = async () => {
    if (!goalName || !goalTarget) {
      Alert.alert('Error', 'Goal name and target are required');
      return;
    }

    setLoading(true);
    try {
      const success = await saveGoal(
        null,
        goalName,
        parseFloat(goalTarget),
        0,
        goalDeadline
      );

      if (success) {
        setNewGoalVisible(false);
        setGoalName('');
        setGoalTarget('');
        setGoalDeadline('');
        Alert.alert('Success', 'Goal added!');
      } else {
        Alert.alert('Error', 'Failed to add goal');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = (id) => {
    Alert.alert('Delete Goal', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: () => deleteGoal(id),
        style: 'destructive',
      },
    ]);
  };

  const overallProgress =
    goals && goals.length > 0
      ? goals.reduce((sum, g) => sum + (g.target > 0 ? g.current / g.target : 0), 0) /
        goals.length
      : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Overall Progress */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>
            Overall Progress
          </Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={Math.min(overallProgress, 1)}
              color="#6200EE"
              style={styles.overallProgress}
            />
            <Text
              variant="labelMedium"
              style={{
                marginTop: 8,
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#6200EE',
              }}
            >
              {(overallProgress * 100).toFixed(0)}% Complete
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Individual Goals */}
      {goals && goals.length > 0 ? (
        goals.map((goal) => {
          const progress = goal.target > 0 ? goal.current / goal.target : 0;
          return (
            <Card key={goal.id} style={styles.card}>
              <Card.Content>
                <View style={styles.goalHeader}>
                  <View style={styles.goalInfo}>
                    <Text variant="titleSmall" style={{ fontWeight: '600' }}>
                      {goal.name}
                    </Text>
                    {goal.deadline && (
                      <Text variant="labelSmall" style={{ color: '#999', marginTop: 4 }}>
                        Deadline: {goal.deadline}
                      </Text>
                    )}
                  </View>
                  <Button
                    icon="trash-can"
                    mode="text"
                    compact
                    textColor="#FF6B6B"
                    onPress={() => handleDeleteGoal(goal.id)}
                  />
                </View>

                <View style={styles.goalStats}>
                  <Text variant="labelSmall" style={{ color: '#666' }}>
                    ${goal.current?.toFixed(2)} / ${goal.target?.toFixed(2)}
                  </Text>
                  <Text variant="labelSmall" style={{ color: '#6200EE', fontWeight: 'bold' }}>
                    {(progress * 100).toFixed(0)}%
                  </Text>
                </View>

                <ProgressBar
                  progress={Math.min(progress, 1)}
                  color="#4ECDC4"
                  style={styles.goalProgress}
                />
              </Card.Content>
            </Card>
          );
        })
      ) : (
        <Card style={styles.card}>
          <Card.Content style={{ alignItems: 'center', paddingVertical: 32 }}>
            <MaterialCommunityIcons
              name="target-outline"
              size={48}
              color="#ccc"
            />
            <Text
              variant="labelMedium"
              style={{ color: '#999', marginTop: 12, textAlign: 'center' }}
            >
              No goals yet. Create one to get started!
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Add Button */}
      <Button
        mode="contained"
        onPress={() => setNewGoalVisible(true)}
        style={styles.addButton}
        icon="plus"
      >
        Add New Goal
      </Button>

      {/* Add Goal Dialog */}
      <Portal>
        <Dialog visible={newGoalVisible} onDismiss={() => setNewGoalVisible(false)}>
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
              label="Target Amount"
              value={goalTarget}
              onChangeText={setGoalTarget}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
              left={<TextInput.Affix text="$" />}
            />
            <TextInput
              label="Deadline (optional)"
              value={goalDeadline}
              onChangeText={setGoalDeadline}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="YYYY-MM-DD"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNewGoalVisible(false)}>Cancel</Button>
            <Button onPress={handleAddGoal} loading={loading} disabled={loading}>
              Add
            </Button>
          </Dialog.Actions>
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
  progressContainer: {
    paddingVertical: 8,
  },
  overallProgress: {
    height: 8,
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
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalProgress: {
    height: 6,
  },
  dialogInput: {
    marginBottom: 12,
  },
  addButton: {
    marginBottom: 32,
  },
});

export default GoalsScreen;
