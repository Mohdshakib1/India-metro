import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

const RechargeScreen = () => {
  // Function to open Paytm Recharge page
  const handleRecharge = () => {
    const paytmURL = 'https://paytm.com/metro-card-recharge/delhi-metro';
    Linking.openURL(paytmURL);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recharge Your Metro Card</Text>

      <TouchableOpacity style={styles.card} onPress={handleRecharge}>
        <Text style={styles.cardText}>Recharge via Paytm</Text>
        <Text style={styles.subText}>Click to open Paytm Metro Recharge</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RechargeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1e1e1e',
  },
  card: {
    backgroundColor: '#0080ff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    elevation: 5,
  },
  cardText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 5,
  },
});
