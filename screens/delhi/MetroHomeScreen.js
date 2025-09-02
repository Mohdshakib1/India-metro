import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import delhiData from '../../data/delhi/delhiMetro.json';


export default function MetroHomeScreen({ route }) {
  const { state } = route.params;
  const [stations, setStations] = useState([]);

  useEffect(() => {
    if (state === 'Delhi') setStations(delhiData.stations);
    else if (state === 'Mumbai') setStations(mumbaiData.stations);
  }, [state]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{state} Metro Stations</Text>
      <FlatList
        data={stations}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, marginBottom: 10, fontWeight: 'bold' },
  item: { fontSize: 18, paddingVertical: 5 },
});