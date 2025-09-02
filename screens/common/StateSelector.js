import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const states = ['Delhi', 'Mumbai','Kolkata','Bangalore'];

export default function StateSelector({ navigation }) {
  const handleStatePress = (state) => {
    if (state === 'Delhi') {
      navigation.navigate('DelhiMetro'); // This should be registered in AppNavigator.js
    } else if (state === 'Mumbai') {
      navigation.navigate('MumbaiMetro'); // This too
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Metro City</Text>
      {states.map((state) => (
        <TouchableOpacity
          key={state}
          style={styles.button}
          onPress={() => handleStatePress(state)}
        >
          <Text style={styles.buttonText}>{state}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 100 },
  title: { fontSize: 24, marginBottom: 20 },
  button: { backgroundColor: '#333', padding: 15, margin: 10, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 18 },
});
