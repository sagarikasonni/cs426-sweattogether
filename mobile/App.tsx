import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import ExploreScreen from './src/screens/ExploreScreen';
import ProfileDetailScreen from './src/screens/ProfileDetailScreen';

export type RootStackParamList = {
  Explore: undefined;
  ProfileDetail: { profileId: number };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="Explore"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f3f4f6',
          },
          headerTintColor: '#374151',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Explore" 
          component={ExploreScreen}
          options={{ title: 'Find Workout Partners' }}
        />
        <Stack.Screen 
          name="ProfileDetail" 
          component={ProfileDetailScreen}
          options={{ title: 'Profile' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
