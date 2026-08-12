import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { triggerEmergencyIfNeeded } from '../components/EmergencyGuard';
import { askOralAI, isOnline } from '../services/api';
import { saveHistoryEntry } from '../services/history';

const starterMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Hi, I can explain oral health topics in plain language. What would you like to learn about?',
  },
];

export default function ChatScreen({ navigation, route }) {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const handledParam = useRef(null);
  const [scanResult, setScanResult] = useState(null);

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const online = await isOnline();
    if (!online) {
      setOffline(true);
      return;
    }

    setOffline(false);
    triggerEmergencyIfNeeded(navigation, { userMessage: text });

    const userMessage = { id: `${Date.now()}-user`, role: 'user', text };
    const pendingMessages = [...messages, userMessage];
    setMessages(pendingMessages);
    setInput('');
    setLoading(true);

    // Build a stronger, explicit context for follow-up questions so the backend
    // always understands the user is referencing the prior scan.
    let finalMessage = text;
    if (scanResult) {
      const diagnosis = (scanResult.prediction || scanResult.label || '').toString();
      const advice = (scanResult.advice || scanResult.recommendation || scanResult.message || scanResult.description || '').toString();
      const lastAssistant = messages.slice().reverse().find((m) => m.role === 'assistant');

      // If the user didn't explicitly mention the diagnosis, always prepend a
      // concise context block so follow-ups like "how do I solve this" are
      // unambiguous when forwarded to Hugging Face.
      const needsContext = diagnosis && !text.toLowerCase().includes(diagnosis.toLowerCase());

      const contextBlock = `Previous analysis: "${diagnosis}".${advice ? ` Summary: ${advice}.` : ''}${lastAssistant ? ` Assistant said: "${lastAssistant.text}".` : ''}`;

      if (needsContext) {
        finalMessage = `${contextBlock} User question: "${text}" Please answer with general, educational ways to address "${diagnosis}" and begin with the disclaimer: "This is educational information and not medical advice — consult a dental professional."`;
      } else {
        finalMessage = `${text} (Reference diagnosis: "${diagnosis}").`;
      }
    }

    const normalizedHistory = pendingMessages
      .filter((message) => message.id !== userMessage.id)
      .map((message) => ({
        isUser: message.role === 'user',
        text: message.text,
      }));

    const response = await askOralAI(finalMessage, normalizedHistory);

    const assistantMessage = {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      text: response.text,
    };
    const nextMessages = [...pendingMessages, assistantMessage];
    setMessages(nextMessages);
    setLoading(false);
    await persistSession(nextMessages);
    triggerEmergencyIfNeeded(navigation, {
      backendFlag: response.isEmergency,
      userMessage: text,
      adviceText: response.text,
    });
  };

  useEffect(() => {
    const session = route.params?.session;
    const starterQuestion = route.params?.starterQuestion;
    const autoSend = route.params?.autoSend;
    const incomingScan = route.params?.scanResult;
    const key = session?.id || starterQuestion;

    if (!key || handledParam.current === key) return;
    handledParam.current = key;

    if (session?.messages) {
      setMessages(session.messages);
      setScanResult(session.scanResult || null);
    } else if (starterQuestion) {
      setInput(starterQuestion);
      setScanResult(incomingScan || null);
      if (autoSend) {
        const timer = setTimeout(() => {
          sendMessage(starterQuestion);
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [route.params]);

  const persistSession = async (nextMessages) => {
    const firstUser = nextMessages.find((message) => message.role === 'user');
    await saveHistoryEntry({
      type: 'chat',
      title: firstUser?.text?.slice(0, 64) || 'Chat session',
      messages: nextMessages,
      scanResult,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Chat</Text>
          <Text style={styles.subtitle}>Ask oral health education questions</Text>
        </View>
        <DisclaimerBanner compact />
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.bubbleText, item.role === 'user' && styles.userBubbleText]}>
                {item.text}
              </Text>
            </View>
          )}
          ListFooterComponent={
            loading ? <ActivityIndicator style={styles.loader} color="#2A9D8F" /> : null
          }
        />
        {offline ? (
          <View style={styles.offlineBar}>
            <Text style={styles.offlineText}>You're offline - reconnect to chat</Text>
            <TouchableOpacity onPress={() => setOffline(false)} style={styles.retryButton}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about oral health..."
            placeholderTextColor="#8A9A97"
            multiline
          />
          <TouchableOpacity
            style={[styles.send, (loading || !input.trim()) && styles.sendDisabled]}
            onPress={() => sendMessage()}
            disabled={loading || !input.trim()}
            activeOpacity={0.85}
          >
            <Ionicons name="send" size={20} color={loading || !input.trim() ? '#C8D2CF' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF8' },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  header: { marginBottom: 14 },
  title: { fontSize: 30, fontWeight: '800', color: '#183B38' },
  subtitle: { marginTop: 4, color: '#667A76', fontSize: 14 },
  list: { paddingVertical: 18, gap: 10 },
  bubble: { maxWidth: '84%', borderRadius: 16, padding: 14 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6ECEA' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2A9D8F' },
  bubbleText: { color: '#334B47', fontSize: 15, lineHeight: 21 },
  userBubbleText: { color: '#FFFFFF', fontWeight: '600' },
  loader: { marginTop: 4 },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end', paddingBottom: 12 },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 118,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE7E4',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#183B38',
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2A9D8F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { backgroundColor: '#C8D2CF' },
  offlineBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0E5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  offlineText: { color: '#9B4F18', fontWeight: '700', flex: 1 },
  retryButton: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: '#FFFFFF' },
  retryText: { color: '#2A9D8F', fontWeight: '800' },
});
