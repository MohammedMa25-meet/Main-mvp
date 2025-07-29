import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export default function RegistrationScreen({ navigation }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = () => {
    // Handle registration logic here
    navigation.navigate('Dashboard');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialIcons name="person-add" size={50} color="#556B2F" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Bridge It today</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <TextInput
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => setFormData({...formData, firstName: text})}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              outlineColor="#556B2F"
              activeOutlineColor="#556B2F"
            />
            <TextInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => setFormData({...formData, lastName: text})}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              outlineColor="#556B2F"
              activeOutlineColor="#556B2F"
            />
          </View>

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            style={styles.input}
            mode="outlined"
            outlineColor="#556B2F"
            activeOutlineColor="#556B2F"
            keyboardType="email-address"
          />

          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            style={styles.input}
            mode="outlined"
            outlineColor="#556B2F"
            activeOutlineColor="#556B2F"
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <TextInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            style={styles.input}
            mode="outlined"
            outlineColor="#556B2F"
            activeOutlineColor="#556B2F"
            secureTextEntry={!showConfirmPassword}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            buttonColor="#556B2F"
          >
            Create Account
          </Button>

          <TouchableOpacity
            onPress={() => navigation.navigate('Welcome')}
            style={styles.linkContainer}
          >
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  form: {
    gap: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    backgroundColor: '#fff',
  },
  halfInput: {
    flex: 1,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  link: {
    color: '#556B2F',
    fontSize: 16,
  },
});