import React, { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getHistory } from '../services/history';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, [])
  );

  const openEntry = (entry) => {
    if (entry.type === 'chat') {
      navigation.navigate('Chat', { session: entry });
    } else {
      navigation.navigate('Image Check', { scan: entry });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Past chat sessions and image scans</Text>
        </View>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={history.length ? styles.list : styles.emptyWrap}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={34} color="#8A9A97" />
              <Text style={styles.emptyTitle}>No history yet</Text>
              <Text style={styles.emptyText}>Chats and scans you complete will appear here.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => openEntry(item)} activeOpacity={0.8}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name={item.type === 'chat' ? 'chatbubble-ellipses-outline' : 'camera-outline'}
                  size={20}
                  color="#2A9D8F"
                />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.rowMeta}>
                  {item.type === 'chat' ? 'Chat session' : 'Image scan'} ·{' '}
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8A9A97" />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF8' },
  container: { flex: 1, padding: 18 },
  header: { marginBottom: 18 },
  title: { fontSize: 30, fontWeight: '800', color: '#183B38' },
  subtitle: { marginTop: 4, color: '#667A76', fontSize: 14 },
  list: { gap: 12, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6ECEA',
    padding: 14,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7F5F2',
  },
  rowText: { flex: 1 },
  rowTitle: { color: '#183B38', fontSize: 15, fontWeight: '800' },
  rowMeta: { color: '#667A76', fontSize: 12, marginTop: 4 },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { color: '#183B38', fontSize: 18, fontWeight: '800', marginTop: 12 },
  emptyText: { color: '#667A76', fontSize: 14, textAlign: 'center', marginTop: 6 },
});
