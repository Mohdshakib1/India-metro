import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import StateSelector from './screens/StateSelector';
import MetroHomeScreen from './screens/MetroHomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="StateSelector" component={StateSelector} />
        <Stack.Screen name="MetroHome" component={MetroHomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
