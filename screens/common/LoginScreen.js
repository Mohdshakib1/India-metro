import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = () => {
    if (phone.length === 10) {
      setOtpSent(true);
    } else {
      alert("Enter a valid 10-digit number");
    }
  };

  const verifyOtp = () => {
    if (otp === "1234") {
      navigation.replace('StateSelector');
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Metro App Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        keyboardType="number-pad"
        value={phone}
        onChangeText={setPhone}
      />
      {otpSent && (
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
        />
      )}
      {!otpSent ? (
        <Button title="Send OTP" onPress={sendOtp} />
      ) : (
        <Button title="Verify OTP" onPress={verifyOtp} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 100 },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  input: { borderBottomWidth: 1, fontSize: 18, marginBottom: 20 },
});