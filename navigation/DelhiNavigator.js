import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import all Delhi metro screens
import MetroHomeScreen from '../screens/delhi/MetroHomeScreen';
import MapScreen from '../screens/delhi/MapScreen';
import FareScreen from '../screens/delhi/FareScreen';
import RouteScreen from '../screens/delhi/RouteScreen';
import TimingScreen from '../screens/delhi/TimingScreen';
import CityDashboard from '../screens/delhi/CityDashboard';
import RechargeScreen from '../screens/delhi/RechargeScreen';
import ResultScreen from '../screens/delhi/ResultScreen';
import UpcomingScreen from '../screens/delhi/UpcomingScreen';

const Stack = createStackNavigator();

const DelhiNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="CityDashboard"
      screenOptions={{
        headerShown: true, // Set to false if you want no header
      }}
    >
      <Stack.Screen name="CityDashboard" component={CityDashboard} />
      <Stack.Screen name="MetroHome" component={MetroHomeScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="Fare" component={FareScreen} />
      <Stack.Screen name="Route" component={RouteScreen} />
      <Stack.Screen name="Timing" component={TimingScreen} />
      <Stack.Screen name="Recharge" component={RechargeScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Upcoming" component={UpcomingScreen} />
    </Stack.Navigator>
  );
};

export default DelhiNavigator;
