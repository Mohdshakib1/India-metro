import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import linesData from '../../data/delhi/delhiMetro.json';

export default function FareScreen({ selectedCity = 'delhi' }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selecting, setSelecting] = useState(null);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [fareDetails, setFareDetails] = useState(null);
  const [routeSteps, setRouteSteps] = useState([]);

  const normalize = (str = '') => str.toLowerCase().replace(/\s+/g, '');

  const { stationMap, graph } = useMemo(() => {
    const stationMap = {};
    const graph = {};

    const cityLines = linesData[selectedCity] || [];
    cityLines.forEach(({ line, color, stations }) => {
      stations.forEach((name) => {
        const key = normalize(name);
        if (!stationMap[key])
          stationMap[key] = { name, lines: [], color, key, connections: {} };
        stationMap[key].lines.push({ line, color });
      });
    });

    cityLines.forEach(({ line, stations }) => {
      for (let i = 0; i < stations.length; i++) {
        const curKey = normalize(stations[i]);
        if (!graph[curKey]) graph[curKey] = new Set();
        if (i > 0) {
          const prevKey = normalize(stations[i - 1]);
          graph[curKey].add(prevKey);
          stationMap[curKey].connections[stationMap[prevKey]?.name] = { line, distance: 1.2 };
        }
        if (i < stations.length - 1) {
          const nextKey = normalize(stations[i + 1]);
          graph[curKey].add(nextKey);
          stationMap[curKey].connections[stationMap[nextKey]?.name] = { line, distance: 1.2 };
        }
      }
    });

    Object.values(stationMap).forEach(({ key }) => {
      if (stationMap[key].lines.length > 1) {
        stationMap[key].lines.forEach((l1) =>
          stationMap[key].lines.forEach((l2) => {
            if (l1.line !== l2.line) graph[normalize(key)].add(normalize(key));
          })
        );
      }
    });

    const sec51 = normalize("Noida Sector 51");
    const sec52 = normalize("Noida Sector 52");
    if (!graph[sec51]) graph[sec51] = new Set();
    if (!graph[sec52]) graph[sec52] = new Set();
    graph[sec51].add(sec52);
    graph[sec52].add(sec51);

    Object.keys(graph).forEach((k) => (graph[k] = Array.from(graph[k])));

    return { stationMap, graph };
  }, [selectedCity]);

  const stations = useMemo(() =>
    Object.values(stationMap).map(({ name, lines, color }) => ({
      name,
      line: lines.map((l) => l.line).join(', '),
      color: lines.length === 1 ? lines[0].color : '#666',
      isInterchange: lines.length > 1,
    })), [stationMap]
  );

  const getFiltered = useCallback(
    (txt) => stations.filter((s) => normalize(s.name).includes(normalize(txt))),
    [stations]
  );

  const handleStationSelect = useCallback((station) => {
    if (selecting === 'from') {
      setFrom(station.name);
      setSelectedFrom(station);
    } else {
      setTo(station.name);
      setSelectedTo(station);
    }
    setSelecting(null);
    setFareDetails(null);
    setRouteSteps([]);
  }, [selecting]);

  const handleSwap = useCallback(() => {
    setFrom(to);
    setTo(from);
    setSelectedFrom(selectedTo);
    setSelectedTo(selectedFrom);
    setFareDetails(null);
    setRouteSteps([]);
  }, [from, to, selectedFrom, selectedTo]);

  const bfsPath = useCallback((startName, endName) => {
    const start = normalize(startName);
    const end = normalize(endName);
    const queue = [[start]];
    const visited = new Set();

    while (queue.length > 0) {
      const path = queue.shift();
      const station = path[path.length - 1];
      if (station === end) return path;
      if (!visited.has(station)) {
        visited.add(station);
        const neighbors = graph[station] || [];
        neighbors.forEach((neighbor) => {
          queue.push([...path, neighbor]);
        });
      }
    }
    return null;
  }, [graph]);

  const getLineChangeCount = (path) => {
    let changes = 0;
    let prevLine = null;
    for (let i = 1; i < path.length; i++) {
      const prevStation = stationMap[path[i - 1]];
      const currStation = stationMap[path[i]];
      if (!prevStation || !currStation) continue;
      const commonLines = prevStation.lines.map(l => l.line).filter(line => currStation.lines.some(l => l.line === line));
      const currentLine = commonLines[0] || currStation.lines[0].line;
      if (prevLine && currentLine !== prevLine) changes++;
      prevLine = currentLine;
    }
    return changes;
  };

  const getDmrcFare = (distance, isSunday, isOffPeak) => {
  let baseFare = 0;

  if (distance <= 2) baseFare = 10;
  else if (distance <= 5) baseFare = 20;
  else if (distance <= 12) baseFare = 30;
  else if (distance <= 21) baseFare = 40;
  else if (distance <= 32) baseFare = 50;
  else if (distance <= 40) baseFare = 60;
  else if (distance <= 50) baseFare = 70;
  else if (distance <= 60) baseFare = 80;
  else baseFare = 90;

  let tokenFare = baseFare;
  let smartCardFare = Math.round(baseFare * 0.9); // 10% discount

  // Sunday ₹10 discount
  if (isSunday) {
    tokenFare = Math.max(0, tokenFare - 10);
    smartCardFare = Math.max(0, smartCardFare - 10);
  }

  return {
    tokenFare,
    smartCardFare,
    discountFare: isOffPeak ? Math.round(baseFare * 0.8) : null // 20% off-peak discount
  };
};


  const isOffPeak = () => {
    const h = new Date().getHours();
    return h < 8 || (h >= 12 && h < 17) || h >= 21;
  };

  const calculateFare = useCallback(() => {
    if (!selectedFrom || !selectedTo) {
      setFareDetails({ error: 'Please select both stations.' });
      return;
    }

    const path = bfsPath(selectedFrom.name, selectedTo.name);
    if (!path) {
      setFareDetails({ error: 'No route found.' });
      setRouteSteps([]);
      return;
    }

    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const current = stationMap[path[i]];
      const next = stationMap[path[i + 1]];
      if (current && next && current.connections[next.name]) {
        totalDistance += current.connections[next.name].distance || 0;
      }
    }

    const isSunday = new Date().getDay() === 0;
    const offPeakNow = isOffPeak();
    const fare = getDmrcFare(totalDistance, isSunday, offPeakNow);
    const stops = path.length - 1;


    setFareDetails({
      from: selectedFrom.name,
      to: selectedTo.name,
      stops,
      totalDistance: totalDistance.toFixed(1),
      tokenFare: fare.tokenFare,
      smartCardFare: fare.smartCardFare,
      discountFare: fare.discountFare,
      dayLabel: isSunday ? 'Sunday (Flat ₹10)' : 'Mon–Sat',
      offPeak: offPeakNow,
    });

    setRouteSteps(path.map((key) => stationMap[key]?.name || key));
  }, [selectedFrom, selectedTo, bfsPath, stationMap]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Delhi Metro Fare</Text>
      <TextInput style={styles.input} placeholder="From" value={from} onFocus={() => setSelecting('from')} onChangeText={(t) => { setFrom(t); setSelecting('from'); }} />
      <TextInput style={styles.input} placeholder="To" value={to} onFocus={() => setSelecting('to')} onChangeText={(t) => { setTo(t); setSelecting('to'); }} />
      <TouchableOpacity style={styles.swapBtn} onPress={handleSwap}>
        <Ionicons name="swap-vertical" size={22} color="white" />
      </TouchableOpacity>
      {selecting && (
        <FlatList
          data={getFiltered(selecting === 'from' ? from : to)}
          keyExtractor={(item) => item.name}
          keyboardShouldPersistTaps="always"
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
      <TouchableOpacity style={styles.fareBtn} onPress={calculateFare}>
        <Text style={styles.fareText}>₹ Show Fare</Text>
      </TouchableOpacity>
      {fareDetails && (
        <View style={styles.fareCard}>
          {fareDetails.error ? (
            <Text style={styles.errorText}>{fareDetails.error}</Text>
          ) : (
            <>
              <Text style={styles.fareHeading}>{fareDetails.from} → {fareDetails.to}</Text>
              <Text style={styles.fareLine}>Stations: {fareDetails.stops}</Text>
              <Text style={styles.fareLine}>Day: {fareDetails.dayLabel}</Text>
              <Text style={styles.fareLine}>Token Fare: ₹{fareDetails.tokenFare}</Text>
              <Text style={styles.fareLine}>Smart Card Fare: ₹{fareDetails.smartCardFare}</Text>
              {fareDetails.discountFare && (
                <Text style={styles.fareLine}>Off-Peak Fare: ₹{fareDetails.discountFare} {fareDetails.offPeak && '(Now)'}</Text>
              )}
              
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  swapBtn: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 12,
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
    height: 40,
    width: 40,
    borderRadius: 6,
    marginRight: 10,
  },
  stationName: { fontSize: 16, fontWeight: 'bold' },
  lineText: { fontSize: 14, color: '#555' },
  interchangeLabel: { fontSize: 13, color: 'red', fontWeight: '600' },
  fareBtn: {
    backgroundColor: '#ffcc00',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    elevation: 3,
  },
  fareText: { fontSize: 18, fontWeight: 'bold' },
  fareCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginTop: 12,
    elevation: 3,
  },
  fareHeading: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  fareLine: { fontSize: 15, marginBottom: 4 },
  errorText: { color: 'red', fontSize: 16, fontWeight: 'bold' },
});
