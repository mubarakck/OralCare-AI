import React from 'react';
import { Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmergencyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.close} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#183B38" />
        </TouchableOpacity>
        <View style={styles.alertIcon}>
          <Ionicons name="alert-circle-outline" size={42} color="#B84A3D" />
        </View>
        <Text style={styles.title}>Urgent dental guidance</Text>
        <Text style={styles.subtitle}>Some symptoms need immediate professional care.</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Swelling that affects breathing</Text>
          <Text style={styles.cardText}>requires immediate ER attention</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sudden tooth loss (Trauma)</Text>
          <Text style={styles.cardText}>best results within 60 minutes</Text>
        </View>
        <TouchableOpacity style={styles.primary} onPress={() => Linking.openURL('tel:911')}>
          <Ionicons name="call" size={19} color="#FFFFFF" />
          <Text style={styles.primaryText}>Call emergency dental line</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondary}
          onPress={() => Linking.openURL('https://www.google.com/maps/search/dental+clinic+near+me')}
        >
          <Ionicons name="location-outline" size={19} color="#B84A3D" />
          <Text style={styles.secondaryText}>Find nearest clinic</Text>
        </TouchableOpacity>
        <Text style={styles.footer}>If breathing is difficult, call 911 or your local emergency number now.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F6' },
  container: { flex: 1, padding: 22 },
  close: {
    alignSelf: 'flex-end',
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  alertIcon: {
    width: 78,
    height: 78,
    borderRadius: 20,
    backgroundColor: '#FFE3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  title: { color: '#7A271E', fontSize: 30, fontWeight: '900', marginTop: 18 },
  subtitle: { color: '#8F4D45', fontSize: 15, marginTop: 8, marginBottom: 18 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0B7AF',
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { color: '#7A271E', fontSize: 17, fontWeight: '900' },
  cardText: { color: '#8F4D45', fontSize: 14, marginTop: 4, fontWeight: '700' },
  primary: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#B84A3D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  secondary: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B84A3D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  secondaryText: { color: '#B84A3D', fontSize: 16, fontWeight: '900' },
  footer: { marginTop: 'auto', color: '#7A271E', fontSize: 14, lineHeight: 20, fontWeight: '800', textAlign: 'center' },
});
