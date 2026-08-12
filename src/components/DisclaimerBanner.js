import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DisclaimerBanner({ compact = false }) {
  return (
    <View style={[styles.banner, compact && styles.compact]}>
      <Ionicons name="information-circle-outline" size={20} color="#2A9D8F" />
      <Text style={styles.text}>
        For education only. OralCare AI does not diagnose, prescribe treatment, or replace a dentist.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: '#E7F5F2',
    borderColor: '#B9E1DA',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  compact: {
    padding: 12,
  },
  text: {
    flex: 1,
    color: '#27645C',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
