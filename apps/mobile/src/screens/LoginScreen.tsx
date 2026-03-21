import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLogin } from '../api/hooks/useAuth';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    login.mutate({ email, password });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FamilyBudget</Text>
      <Text style={styles.subtitle}>Track your family's finances</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {login.isError && (
          <Text style={styles.error}>Invalid email or password</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={login.isPending}>
          {login.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#eff6ff' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1d4ed8', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 8, marginBottom: 32 },
  form: { backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 2 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12,
    marginBottom: 12, fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#ef4444', fontSize: 14, marginBottom: 8 },
  link: { color: '#2563eb', textAlign: 'center', marginTop: 16, fontSize: 14 },
});
