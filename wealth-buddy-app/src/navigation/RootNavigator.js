import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, shadows, borderRadius } from '../theme';

import DashboardScreen from '../screens/DashboardScreen-modern';
import QuickAddScreen from '../screens/QuickAddScreen';
import CalendarScreen from '../screens/CalendarScreen';
import RecurringScreen from '../screens/RecurringScreen';
import GoalsScreen from '../screens/GoalsScreen';
import SettingsScreen from '../screens/SettingsScreen-minimal';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: colors.text.primary,
  headerTitleStyle: {
    fontWeight: '700',
    fontSize: 18,
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: colors.background.primary,
  },
};

const DashboardStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="DashboardMain"
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
  </Stack.Navigator>
);

const QuickAddStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="QuickAddMain"
      component={QuickAddScreen}
      options={{ title: 'Quick Add' }}
    />
  </Stack.Navigator>
);

const CalendarStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="CalendarMain"
      component={CalendarScreen}
      options={{ title: 'Calendar' }}
    />
  </Stack.Navigator>
);

const RecurringStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="RecurringMain"
      component={RecurringScreen}
      options={{ title: 'Recurring' }}
    />
  </Stack.Navigator>
);

const GoalsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="GoalsMain"
      component={GoalsScreen}
      options={{ title: 'Goals' }}
    />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="SettingsMain"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </Stack.Navigator>
);

// Custom tab bar button with glow effect
const TabIcon = ({ focused, color, iconName, size }) => {
  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconFocused]}>
      <MaterialCommunityIcons
        name={iconName}
        size={focused ? size + 2 : size}
        color={focused ? colors.primary.main : colors.text.muted}
      />
    </View>
  );
};

export const RootNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Dashboard') {
          iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
        } else if (route.name === 'QuickAdd') {
          iconName = 'plus-circle';
        } else if (route.name === 'Calendar') {
          iconName = focused ? 'calendar-month' : 'calendar-month-outline';
        } else if (route.name === 'Recurring') {
          iconName = 'repeat';
        } else if (route.name === 'Goals') {
          iconName = focused ? 'trophy' : 'trophy-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'cog' : 'cog-outline';
        }

        return <TabIcon focused={focused} color={color} iconName={iconName} size={22} />;
      },
      tabBarActiveTintColor: colors.primary.main,
      tabBarInactiveTintColor: colors.text.muted,
      headerShown: false,
      lazy: false,
      gestureEnabled: true,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabBarLabel,
      tabBarItemStyle: styles.tabBarItem,
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardStack} />
    <Tab.Screen
      name="QuickAdd"
      component={QuickAddStack}
      options={{
        tabBarLabel: 'Add',
        tabBarIcon: ({ focused }) => (
          <View style={[styles.addButton, focused && styles.addButtonFocused]}>
            <MaterialCommunityIcons
              name="plus"
              size={28}
              color={colors.text.primary}
            />
          </View>
        ),
      }}
    />
    <Tab.Screen name="Calendar" component={CalendarStack} />
    <Tab.Screen name="Recurring" component={RecurringStack} />
    <Tab.Screen name="Goals" component={GoalsStack} />
    <Tab.Screen name="Settings" component={SettingsStack} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    height: Platform.OS === 'web' ? 70 : 85,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'web' ? 8 : 24,
    paddingHorizontal: 8,
    ...shadows.md,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: borderRadius.lg,
  },
  tabIconFocused: {
    backgroundColor: colors.primary.glow,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    ...shadows.glow(colors.primary.main),
  },
  addButtonFocused: {
    backgroundColor: colors.primary.light,
    transform: [{ scale: 1.05 }],
  },
});
