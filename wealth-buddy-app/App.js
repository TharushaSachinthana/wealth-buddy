import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { AppProvider } from './src/context/AppContext-v2';
import { RootNavigator } from './src/navigation/RootNavigator';
import { paperTheme, colors } from './src/theme';

// Dark navigation theme
const navigationTheme = {
  dark: true,
  colors: {
    primary: colors.primary.main,
    background: colors.background.primary,
    card: colors.background.secondary,
    text: colors.text.primary,
    border: colors.border.light,
    notification: colors.danger.main,
  },
};

export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <AppProvider>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </PaperProvider>
  );
}

