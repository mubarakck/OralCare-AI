import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen({ onAccepted }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.mark}>
          <Ionicons name="sparkles-outline" size={34} color="#2A9D8F" />
        </View>
        <Text style={styles.title}>OralCare AI</Text>
        <Text style={styles.subtitle}>AI-powered oral health education assistant</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Before you continue</Text>
          <Text style={styles.copy}>
            OralCare AI provides educational information only. It does not diagnose conditions,
            prescribe treatment, or replace care from a licensed dentist.
          </Text>
          <Text style={styles.copy}>
            For severe pain, swelling that affects breathing, trauma, or bleeding that will not stop,
            seek urgent care immediately.
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={onAccepted} activeOpacity={0.85}>
          <Text style={styles.buttonText}>I understand</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF8' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  mark: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7F5F2',
    marginBottom: 18,
  },
  title: { fontSize: 34, fontWeight: '800', color: '#183B38' },
  subtitle: { fontSize: 16, color: '#667A76', marginTop: 8, marginBottom: 28 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6ECEA',
    marginBottom: 24,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#183B38', marginBottom: 10 },
  copy: { color: '#526A66', fontSize: 14, lineHeight: 21, marginBottom: 10 },
  button: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#2A9D8F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
