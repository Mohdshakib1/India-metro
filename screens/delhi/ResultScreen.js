import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

export default function ResultScreen({ route }) {
  const { path = [], time = '0', stationMap = {} } = route.params || {};

  const getKey = (station) => {
    if (!station || typeof station !== 'string') return '';
    return station.toLowerCase().replace(/\s+/g, '');
  };

  const getLines = (station) => {
    const key = getKey(station);
    return stationMap[key]?.lines?.map(line => line.line) || [];
  };

  const getColor = (station, prevStation) => {
    const currentLines = stationMap[getKey(station)]?.lines || [];
    const prevLines = stationMap[getKey(prevStation)]?.lines || [];
    const commonLine = currentLines.find(line => prevLines.some(prev => prev.line === line.line));
    return commonLine?.color || currentLines[0]?.color || '#000';
  };

  const getLineName = (station, prevStation) => {
    const currentLines = stationMap[getKey(station)]?.lines || [];
    const prevLines = stationMap[getKey(prevStation)]?.lines || [];
    const commonLine = currentLines.find(line => prevLines.some(prev => prev.line === line.line));
    return commonLine?.line || currentLines[0]?.line || 'Unknown Line';
  };

  const getEstimatedTime = (index) => `~${index * 2} min`;

  const getLineChange = (current, previous, beforePrevious) => {
    if (!previous || !beforePrevious) return null;
    const prevLine = getLineName(previous, beforePrevious);
    const currLine = getLineName(current, previous);
    return currLine !== prevLine ? currLine : null;
  };

  const calculateFare = (stations) => {
    if (stations <= 2) return 10;
    else if (stations <= 5) return 20;
    else if (stations <= 8) return 30;
    else if (stations <= 11) return 40;
    else if (stations <= 14) return 50;
    else if (stations <= 17) return 60;
    else if (stations <= 20) return 70;
    else if (stations <= 23) return 80;
    else return 90;
  };

  const countLineChanges = () => {
    let changes = 0;
    for (let i = 2; i < path.length; i++) {
      const prevLine = getLineName(path[i - 1], path[i - 2]);
      const currLine = getLineName(path[i], path[i - 1]);
      if (currLine !== prevLine) changes++;
    }
    return changes;
  };

  const actualFare = calculateFare(path.length);
  const discount = 10;
  const finalFare = Math.max(0, actualFare - discount);
  const lineChanges = countLineChanges();

  return (
    <ScrollView style={styles.container}>
      {/* Notice */}
      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>
          Time shown is estimated travel time only.{"\n"}Passengers are advised to keep extra time to travel.
        </Text>
      </View>

      {/* Route Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.routeText}>
          {path[0]} <Text style={{ fontWeight: 'bold' }}>→</Text> {path[path.length - 1]}
        </Text>

        <View style={styles.summaryGrid}>
          {/* Fare Display with Discount */}
          <View style={styles.summaryItem}>
           
            <Text style={[styles.summaryValue, { color: '#000' }]}>₹{finalFare}</Text>
            <Text style={styles.summaryLabel}>Fare</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{time}</Text>
            <Text style={styles.summaryLabel}>Min</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{path.length}</Text>
            <Text style={styles.summaryLabel}>Stations</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{lineChanges}</Text>
            <Text style={styles.summaryLabel}>Line Change</Text>
          </View>
        </View>
      </View>

      {/* Station List */}
      {path.map((station, index) => {
        if (!station) return null;
        const prevStation = index > 0 ? path[index - 1] : null;
        const beforePrevStation = index > 1 ? path[index - 2] : null;
        const lineChange = getLineChange(station, prevStation, beforePrevStation);

        return (
          <View key={index}>
            {lineChange && (
              <View style={styles.interchangeBox}>
                <Text style={styles.interchangeText}>
                  🚉 Change here to <Text style={{ fontWeight: 'bold' }}>{lineChange}</Text> Line
                </Text>
              </View>
            )}
            <View style={styles.stationRow}>
              <View style={[styles.stationBadge, { backgroundColor: getColor(station, prevStation) }]}>
                <Text style={styles.stationIndex}>{index + 1}</Text>
              </View>

              <View style={styles.stationDetails}>
                <Text style={styles.stationName}>{station}</Text>
                <Text style={styles.lineText}>{getLineName(station, prevStation)}</Text>
                <Text style={styles.timeText}>{getEstimatedTime(index)}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fefefe',
    flex: 1,
  },
  noticeBox: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ffeeba',
    borderWidth: 1,
    marginBottom: 16,
  },
  noticeText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryBox: {
    backgroundColor: '#eaf1ff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderColor: '#cfdff6',
    borderWidth: 1,
  },
  routeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '45%',
    marginVertical: 8,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#777',
  },
  interchangeBox: {
    marginBottom: 5,
    padding: 8,
    borderLeftColor: '#007bff',
    borderLeftWidth: 4,
    backgroundColor: '#e0f0ff',
    borderRadius: 6,
    marginTop: 8,
  },
  interchangeText: {
    fontSize: 13,
    color: '#003366',
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  stationBadge: {
    height: 70,
    width: 70,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stationIndex: {
    fontSize: 25,
    color: 'black',
    fontWeight: 'bold',
  },
  stationDetails: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lineText: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});
