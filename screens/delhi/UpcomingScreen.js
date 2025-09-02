import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UpcomingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Next Metro Timings Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 22, fontWeight: 'bold' },
});