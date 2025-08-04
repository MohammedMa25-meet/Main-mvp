import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';

// Import context providers
import { DarkModeProvider } from './src/context/DarkModeContext';
import { UserProvider } from './src/context/UserContext';
import { LanguageProvider } from './src/context/LanguageContext';

// Import all of your screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import MainScreen from './src/screens/MainScreen';
import JobDetailsScreen from './src/screens/jobdetails';
import CourseDetailScreen from './src/screens/coursedetail';

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
                  // Hide the default header for all screens
                  headerShown: false,
                }}
              >
                {/* Screens for users who are not logged in */}
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Registration" component={RegistrationScreen} />
                <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />

                {/* Main app screen (contains the tab navigator) */}
                <Stack.Screen name="MainScreen" component={MainScreen} />

                {/* Detail screens that can be accessed from within the main app */}
                <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
                <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
              </Stack.Navigator>
              <StatusBar style="auto" />
            </NavigationContainer>
          </PaperProvider>
        </DarkModeProvider>
      </UserProvider>
    </LanguageProvider>
  );
}