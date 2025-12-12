import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      options={{ title: 'Dashboard', headerShown: false }}
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

const TabIcon = ({ focused, color, iconName, size }) => {
  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconFocused]}>
      <MaterialCommunityIcons
        name={iconName}
        size={24}
        color={color}
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
      tabBarBackground: () => (
        <View style={styles.tabBackground} />
      ),
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardStack} />
    <Tab.Screen name="Calendar" component={CalendarStack} />
    <Tab.Screen
      name="QuickAdd"
      component={QuickAddStack}
      options={{
        tabBarLabel: 'Add',
        tabBarIcon: ({ focused }) => (
          <View style={[styles.addButtonContainer, focused && styles.addButtonFocused]}>
            <LinearGradient
              colors={colors.gradients.button}
              style={styles.addButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons
                name="plus"
                size={30}
                color="#fff"
              />
            </LinearGradient>
          </View>
        ),
      }}
    />
    <Tab.Screen name="Recurring" component={RecurringStack} />
    <Tab.Screen name="Goals" component={GoalsStack} />
    {/* Settings is accessed via dashboard header in new design, but keeping tab for fallback/consistency */}
    <Tab.Screen
      name="Settings"
      component={SettingsStack}
      options={{
        tabBarItemStyle: { display: 'none' } // Hidden as requested by design implies profile access
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'web' ? 80 : 90,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'web' ? 10 : 30,
  },
  tabBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 22, 36, 0.95)', // Deep dark with slight opacity
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
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
    // backgroundColor: 'rgba(0, 217, 255, 0.1)', // Subtle glow behind icon
  },
  addButtonContainer: {
    top: -20,
    shadowColor: colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonFocused: {
    transform: [{ scale: 1.05 }],
  },
});
