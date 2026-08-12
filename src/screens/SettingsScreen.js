import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clearHistory } from '../services/history';

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);

  const handleClearHistory = async () => {
    await clearHistory();
    Alert.alert('History cleared', 'Your local chat and scan history has been removed.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.section}>
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Ionicons name="notifications-outline" size={20} color="#2A9D8F" />
              <Text style={styles.itemText}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#D5DEDB', true: '#A9DDD6' }}
              thumbColor={notifications ? '#2A9D8F' : '#FFFFFF'}
            />
          </View>
          <SettingsItem
            icon="document-text-outline"
            label="Review disclaimer"
            onPress={() => navigation.navigate('Disclaimer')}
          />
          <SettingsItem icon="trash-outline" label="Clear chat history" destructive onPress={handleClearHistory} />
          <SettingsItem
            icon="information-circle-outline"
            label="About this app"
            onPress={() => navigation.navigate('AboutApp')}
          />
          <SettingsItem
            icon="lock-closed-outline"
            label="Privacy policy"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
        </View>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

function SettingsItem({ icon, label, destructive = false, onPress }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={20} color={destructive ? '#B84A3D' : '#2A9D8F'} />
        <Text style={[styles.itemText, destructive && styles.destructive]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#8A9A97" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF8' },
  container: { flex: 1, padding: 18 },
  title: { fontSize: 30, fontWeight: '800', color: '#183B38', marginBottom: 18 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6ECEA',
    overflow: 'hidden',
  },
  item: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#EDF2F0',
    borderBottomWidth: 1,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemText: { color: '#183B38', fontSize: 15, fontWeight: '700' },
  destructive: { color: '#B84A3D' },
  version: { textAlign: 'center', color: '#8A9A97', marginTop: 'auto', paddingBottom: 16 },
});
