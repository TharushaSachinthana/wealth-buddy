import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Text, Button, TextInput, Dialog, Portal } from 'react-native-paper';
import { useApp } from '../context/AppContext-v2';

const SettingsScreen = () => {
  const { user, goals, updateSettings, saveGoal } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [salary, setSalary] = useState(user?.salary?.toString() || '');
  const [savingsPercent, setSavingsPercent] = useState(
    user?.savingsPercent?.toString() || ''
  );
  const [bufferPercent, setBufferPercent] = useState(user?.bufferPercent?.toString() || '');
  const [newGoalVisible, setNewGoalVisible] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    if (!name || !salary) {
      Alert.alert('Error', 'Name and salary are required');
      return;
    }

    setLoading(true);
    try {
      const success = await updateSettings(
        name,
        parseFloat(salary),
        parseFloat(savingsPercent),
        parseFloat(bufferPercent)
      );

      if (success) {
        setEditMode(false);
        Alert.alert('Success', 'Settings updated!');
      } else {
        Alert.alert('Error', 'Failed to update settings');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      {editMode ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>
              Edit Profile
            </Text>

            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Monthly Salary"
              value={salary}
              onChangeText={setSalary}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
              left={<TextInput.Affix text="$" />}
            />

            <TextInput
              label="Savings %"
              value={savingsPercent}
              onChangeText={setSavingsPercent}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
              right={<TextInput.Affix text="%" />}
            />

            <TextInput
              label="Buffer %"
              value={bufferPercent}
              onChangeText={setBufferPercent}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
              right={<TextInput.Affix text="%" />}
            />

            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => setEditMode(false)}
                style={styles.halfButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveSettings}
                loading={Boolean(loading)}
                disabled={Boolean(loading)}
                style={styles.halfButton}
              >
                Save
              </Button>
            </View>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>
              Profile
            </Text>

            <View style={styles.infoRow}>
              <Text variant="labelMedium">Name:</Text>
              <Text variant="labelMedium" style={{ fontWeight: '600' }}>
                {name}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="labelMedium">Monthly Salary:</Text>
              <Text variant="labelMedium" style={{ fontWeight: '600' }}>
                ${parseFloat(salary).toFixed(2)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="labelMedium">Savings Allocation:</Text>
              <Text variant="labelMedium" style={{ fontWeight: '600' }}>
                {savingsPercent}%
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="labelMedium">Buffer Allocation:</Text>
              <Text variant="labelMedium" style={{ fontWeight: '600' }}>
                {bufferPercent}%
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={() => setEditMode(true)}
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Goals Management */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>
            Goals ({goals?.length || 0})
          </Text>

          {goals && goals.length > 0 ? (
            goals.map((goal) => (
              <View key={goal.id} style={styles.goalItem}>
                <Text variant="labelMedium" style={{ fontWeight: '600' }}>
                  {goal.name}
                </Text>
                <Text variant="labelSmall" style={{ color: '#666', marginTop: 2 }}>
                  Target: ${goal.target?.toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <Text variant="labelSmall" style={{ color: '#999', marginBottom: 12 }}>
              No goals yet
            </Text>
          )}

          <Button
            mode="outlined"
            onPress={() => setNewGoalVisible(true)}
            style={styles.addGoalButton}
          >
            Add New Goal
          </Button>
        </Card.Content>
      </Card>

      {/* App Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>
            App Information
          </Text>
          <Text variant="labelSmall" style={{ color: '#666', lineHeight: 20 }}>
            Wealth Buddy helps you manage your monthly budget allocation across{' '}
            essentials, savings, discretionary spending, and buffer funds.
          </Text>
          <Text
            variant="labelSmall"
            style={{ color: '#999', marginTop: 12, textAlign: 'center' }}
          >
            Version 1.0.0
          </Text>
        </Card.Content>
      </Card>

      {/* Add Goal Dialog */}
      <Portal>
        <Dialog visible={Boolean(newGoalVisible)} onDismiss={() => setNewGoalVisible(false)}>
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
            <Button onPress={handleAddGoal} loading={Boolean(loading)} disabled={Boolean(loading)}>
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
  input: {
    marginBottom: 12,
  },
  dialogInput: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  halfButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  editButton: {
    marginTop: 12,
  },
  goalItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
  },
  addGoalButton: {
    marginTop: 12,
  },
});

export default SettingsScreen;
