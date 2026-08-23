import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Browse the menu, or sign in as staff/admin</Text>

      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Menu')}>
        <Text style={styles.primaryButtonText}>View Menu</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.secondaryButtonText}>Staff / Admin Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 16, textAlign: 'center' },
  primaryButton: { backgroundColor: '#1f6feb', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' },
  secondaryButtonText: { color: '#333', fontSize: 16, fontWeight: '600' },
});
