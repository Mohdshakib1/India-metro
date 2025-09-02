// navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/common/LoginScreen';
import StateSelector from '../screens/common/StateSelector';
import DelhiNavigator from './DelhiNavigator';
// import MumbaiNavigator from './MumbaiNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="StateSelector" component={StateSelector} />
      <Stack.Screen name="DelhiMetro" component={DelhiNavigator} />
      {/* <Stack.Screen name="MumbaiMetro" component={MumbaiNavigator} /> */}
    </Stack.Navigator>
  );
}
