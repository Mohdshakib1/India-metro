import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import linesData from '../../data/delhi/delhiMetro.json';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // ✅ FIXED: Import Ionicons

export default function RouteScreen({ selectedCity = 'delhi' }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selecting, setSelecting] = useState(null);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const navigation = useNavigation();

  const normalize = (str) => str.toLowerCase().replace(/\s+/g, '');

  // Build station map
  const stationMap = {};
  linesData[selectedCity].forEach((line) => {
    line.stations.forEach((station) => {
      const key = normalize(station);
      if (!stationMap[key]) stationMap[key] = { name: station, lines: [] };
      stationMap[key].lines.push({ line: line.line, color: line.color });
    });
  });

  const stations = Object.values(stationMap).map((s) => ({
    name: s.name,
    line: s.lines.map((l) => l.line).join(', '),
    color: s.lines.length > 1 ? '#666' : s.lines[0].color,
    isInterchange: s.lines.length > 1,
  }));

  const getFiltered = (text) =>
    stations.filter((s) => normalize(s.name).includes(normalize(text)));

  const handleStationSelect = (station) => {
    if (selecting === 'from') {
      setFrom(station.name);
      setSelectedFrom(station);
    } else {
      setTo(station.name);
      setSelectedTo(station);
    }
    setSelecting(null);
  };

  const handleSwap = () => {
    const tempFrom = from;
    const tempTo = to;
    const tempSelectedFrom = selectedFrom;
    const tempSelectedTo = selectedTo;

    setFrom(tempTo);
    setTo(tempFrom);
    setSelectedFrom(tempSelectedTo);
    setSelectedTo(tempSelectedFrom);
  };

  const buildGraph = () => {
    const graph = {};

    linesData[selectedCity].forEach((line) => {
      const { stations } = line;
      for (let i = 0; i < stations.length; i++) {
        const curr = normalize(stations[i]);
        if (!graph[curr]) graph[curr] = new Set();

        if (i > 0) graph[curr].add(normalize(stations[i - 1]));
        if (i < stations.length - 1) graph[curr].add(normalize(stations[i + 1]));
      }
    });

    // Interchange connections
    Object.keys(stationMap).forEach((key) => {
      const lines = stationMap[key].lines;
      if (lines.length > 1) graph[key].add(key); // simulate 0-cost switch
    });

    // Aqua ↔ Blue connection (Noida Sec 51 & 52)
    const sec51 = normalize('Noida Sector 51');
    const sec52 = normalize('Noida Sector 52');

    if (!graph[sec51]) graph[sec51] = new Set();
    if (!graph[sec52]) graph[sec52] = new Set();

    graph[sec51].add(sec52);
    graph[sec52].add(sec51);

    Object.keys(graph).forEach((key) => {
      graph[key] = Array.from(graph[key]);
    });

    return graph;
  };

  const bfsRoute = (start, end) => {
    const graph = buildGraph();
    const queue = [[normalize(start), [start]]];
    const visited = new Set();

    while (queue.length > 0) {
      const [node, path] = queue.shift();
      if (node === normalize(end)) return path;
      if (visited.has(node)) continue;
      visited.add(node);

      for (const neighbor of graph[node] || []) {
        const realName = stationMap[neighbor]?.name || neighbor;
        queue.push([neighbor, [...path, realName]]);
      }
    }

    return null;
  };

  const showRoute = () => {
    if (!selectedFrom || !selectedTo) {
      alert('Select both From and To stations');
      return;
    }

    const foundRoute = bfsRoute(selectedFrom.name, selectedTo.name);
    if (!foundRoute) {
      alert('No route found!');
      return;
    }

    const time = foundRoute.length * 2;
    const fare = foundRoute.length <= 5 ? 10 : foundRoute.length <= 10 ? 20 : 40;

    // Detect interchanges
    const changes = [];
    let prevLines = stationMap[normalize(foundRoute[0])]?.lines.map((l) => l.line);

    for (let i = 1; i < foundRoute.length; i++) {
      const currentLines = stationMap[normalize(foundRoute[i])]?.lines.map((l) => l.line);
      const common = prevLines.find((line) => currentLines.includes(line));
      if (!common) changes.push(foundRoute[i]);
      prevLines = currentLines;
    }

    const cleanStationMap = Object.fromEntries(
      Object.entries(stationMap).map(([key, val]) => [
        key,
        { name: val.name, lines: val.lines },
      ])
    );

    navigation.navigate('Result', {
      path: foundRoute,
      time,
      fare,
      changes,
      stationMap: cleanStationMap,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Delhi Metro Route</Text>

      <TextInput
        style={styles.input}
        placeholder="From"
        value={from}
        onFocus={() => setSelecting('from')}
        onChangeText={(text) => {
          setFrom(text);
          setSelecting('from');
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="To"
        value={to}
        onFocus={() => setSelecting('to')}
        onChangeText={(text) => {
          setTo(text);
          setSelecting('to');
        }}
      />

        <TouchableOpacity style={styles.swapIconBox} onPress={handleSwap}>
        <Ionicons name="swap-vertical" size={22} color="white" />
      </TouchableOpacity>

      {selecting && (
        <FlatList
          data={getFiltered(selecting === 'from' ? from : to)}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
  <TouchableOpacity style={styles.stationBox} onPress={() => handleStationSelect(item)}>
    <View style={[styles.colorSquare, { backgroundColor: item.color }]} />
    <View style={{ flex: 1 }}>
      <Text style={styles.stationName}>{item.name}</Text>
      <Text style={styles.lineText}>{item.line}</Text>
      {item.isInterchange && <Text style={styles.interchangeLabel}>Interchange</Text>}
    </View>
  </TouchableOpacity>
)}

        />
      )}

      <TouchableOpacity style={styles.showBtn} onPress={showRoute}>
        <Text style={styles.showText}>🚇 Show Route</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  stationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 5,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  colorSquare: {
    height: 30,
    width: 30,
    borderRadius: 6,
    marginRight: 10,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lineText: {
    fontSize: 14,
    color: '#555',
  },
  interchangeLabel: {
  color: 'red',
  fontWeight: 'bold',
  marginTop: 2,
},

  swapIconBox: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    alignSelf: 'center',
    marginVertical: 6,
  },
  swapIcon: {
  backgroundColor: '#333',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 12,
  },
  showBtn: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  showText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
