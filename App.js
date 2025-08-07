import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Not currently used, but kept for context
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons'; // Not currently used, but kept for context

// Import context
import { DarkModeProvider } from './src/context/DarkModeContext';
import { UserProvider } from './src/context/UserContext';
import { LanguageProvider } from './src/context/LanguageContext';

// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import MainScreen from './src/screens/MainScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <DarkModeProvider>
          <PaperProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{
                  headerShown: false, // <-- ADD THIS LINE HERE to hide header for ALL screens
                  // The following header styles will now be effectively ignored
                  // because the header itself is hidden.
                  // headerStyle: {
                  //   backgroundColor: '#556B2F', // Olive color
                  // },
                  // headerTintColor: '#fff',
                  // headerTitleStyle: {
                  //   fontWeight: 'bold',
                  // },
                }}
              >
                <Stack.Screen
                  name="Welcome"
                  component={WelcomeScreen}
                  // You can remove options={{ title: 'Welcome' }} if the header is always hidden,
                  // as the title won't be displayed anyway.
                  // If you ever re-enable headers, you might want this back.
                  options={{ title: 'Welcome' }} // Keeping it for potential future use or context
                />
                <Stack.Screen
                  name="Registration"
                  component={RegistrationScreen}
                  options={{ title: 'Registration' }} // Keeping it for potential future use or context
                />
                <Stack.Screen
                  name="Questionnaire"
                  component={QuestionnaireScreen}
                  // No need for headerShown: false here anymore, as it's handled by the navigator
                />
                <Stack.Screen
                  name="MainScreen"
                  component={MainScreen}
                  // No need for headerShown: false here anymore, as it's handled by the navigator
                />
              </Stack.Navigator>
              <StatusBar style="light" />
            </NavigationContainer>
          </PaperProvider>
        </DarkModeProvider>
      </UserProvider>
    </LanguageProvider>
  );
}