import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const tiles = [
  { title: 'Fare', icon: '🎫', screen: 'Fare' },
  { title: 'Route', icon: '🧭', screen: 'Route' },
  { title: 'Map', icon: '🗺️', screen: 'Map' },
  { title: 'Timings', icon: '⏰', screen: 'Timing' },
  { title: 'Next Metro', icon: '🔁', screen: 'Upcoming' },
  { title: 'Parking', icon: '🅿️', screen: 'Parking' },      // Only include if registered
  { title: 'Gates', icon: '🚪', screen: 'Gates' },            // Only include if registered
  { title: 'Recharge', icon: '💳', screen: 'Recharge' },
];

export default function CityDashboard() {
  const navigation = useNavigation();
  const route = useRoute();
  const { state = 'Your' } = route.params || {};

  const renderTile = ({ item }) => (
    <TouchableOpacity
      style={styles.tile}
      onPress={() => {
        if (item.screen) {
          navigation.navigate(item.screen, { state });
        }
      }}
    >
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.label}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{state} Metro Dashboard</Text>
      <FlatList
        data={tiles}
        numColumns={3}
        keyExtractor={(item) => item.title}
        renderItem={renderTile}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;
const tileWidth = (screenWidth - 60) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  grid: {
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  tile: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    width: tileWidth,
    alignItems: 'center',
    elevation: 3,
  },
  icon: {
    fontSize: 28,
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
