import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PAGE_CONTENT = {
  Disclaimer: {
    title: 'Disclaimer',
    icon: 'document-text-outline',
    sections: [
      {
        heading: 'Educational use only',
        body: 'OralCare AI provides general oral health education. It does not diagnose conditions, prescribe treatment, or replace advice from a licensed dentist, doctor, or other qualified health professional.',
      },
      {
        heading: 'Care decisions',
        body: 'Do not use app responses as the only basis for treatment decisions. If you have pain, swelling, bleeding, injury, or symptoms that concern you, contact a dental professional for an in-person assessment.',
      },
      {
        heading: 'Urgent symptoms',
        body: 'Seek urgent or emergency care immediately for severe swelling, facial or jaw swelling, trauma, uncontrolled bleeding, fever with possible infection, or trouble breathing or swallowing.',
      },
    ],
  },
  AboutApp: {
    title: 'About this app',
    icon: 'information-circle-outline',
    sections: [
      {
        heading: 'Purpose',
        body: 'OralCare AI is a student capstone project designed to support oral health learning through a chat assistant, image-based educational scan results, local history, and emergency guidance prompts.',
      },
      {
        heading: 'Assistant',
        body: 'The chat assistant answers general oral health questions in plain language and is designed to keep responses educational, cautious, and easy to read on a phone.',
      },
      {
        heading: 'Image check',
        body: 'The image check feature can highlight possible oral health categories for learning purposes. Results are not a diagnosis and should be confirmed by a dental professional.',
      },
    ],
  },
  PrivacyPolicy: {
    title: 'Privacy policy',
    icon: 'lock-closed-outline',
    sections: [
      {
        heading: 'Information you enter',
        body: 'The app may send chat questions and uploaded images to the backend service so it can generate educational responses or scan results.',
      },
      {
        heading: 'Local storage',
        body: 'Chat and scan history may be saved on your device to let you review past sessions. You can clear this history from Settings.',
      },
      {
        heading: 'API services',
        body: 'The backend may use third-party AI services to process chat messages. Do not enter private medical, financial, or identity information into the app.',
      },
      {
        heading: 'Student project scope',
        body: 'This app is built for demonstration and learning. It is not intended for clinical record keeping, emergency communication, or professional dental care management.',
      },
    ],
  },
};

export default function InfoPageScreen({ navigation, route }) {
  const content = PAGE_CONTENT[route.name] ?? PAGE_CONTENT.AboutApp;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={24} color="#183B38" />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Ionicons name={content.icon} size={24} color="#2A9D8F" />
          <Text style={styles.title}>{content.title}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {content.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF8' },
  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECEA',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECEA',
    marginBottom: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: '#183B38', fontSize: 28, fontWeight: '800' },
  content: { padding: 18, paddingBottom: 32, gap: 14 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6ECEA',
    padding: 16,
  },
  heading: { color: '#183B38', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  body: { color: '#425C58', fontSize: 15, lineHeight: 22 },
});
