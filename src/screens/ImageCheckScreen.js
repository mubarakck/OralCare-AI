import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { triggerEmergencyIfNeeded } from '../components/EmergencyGuard';
import { isOnline, predictDisease } from '../services/api';
import { saveHistoryEntry } from '../services/history';

export default function ImageCheckScreen({ navigation, route }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const scan = route.params?.scan;
    if (scan) {
      setImage(scan.imageUri || null);
      setResult(scan.result || null);
      setOffline(false);
    }
  }, [route.params]);

  const ensureOnline = async () => {
    const online = await isOnline();
    setOffline(!online);
    return online;
  };

  const retryOnline = async () => {
    await ensureOnline();
  };

  const takePhoto = async () => {
    if (!(await ensureOnline())) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera access to scan.');
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!pickerResult.canceled) {
      const uri = pickerResult.assets[0].uri;
      setImage(uri);
      handleUpload(uri);
    }
  };

  const pickImage = async () => {
    if (!(await ensureOnline())) return;

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!pickerResult.canceled) {
      const uri = pickerResult.assets[0].uri;
      setImage(uri);
      handleUpload(uri);
    }
  };

  const resultAdvice = (data) =>
    data?.advice || data?.recommendation || data?.message || data?.description || data?.prediction || '';

  const handleUpload = async (uri) => {
    setLoading(true);
    setResult(null);
    const data = await predictDisease(uri);

    if (data?.error) {
      const fallbackMessage = data.status === 503 || data.status === 502 || data.status === 504
        ? 'The scanner is still warming up. Please wait a moment and try again.'
        : data.message || 'The image analysis service is temporarily unavailable. Please try again in a moment.';

      Alert.alert('Scan unavailable', fallbackMessage);
      setLoading(false);
      return;
    }

    if (data) {
      setResult(data);
      await saveHistoryEntry({
        type: 'scan',
        title: data.prediction || data.label || 'Image scan',
        imageUri: uri,
        result: data,
      });
      triggerEmergencyIfNeeded(navigation, { adviceText: resultAdvice(data) });
    } else {
      Alert.alert('Error', 'Could not analyze image. Please try again.');
    }
    setLoading(false);
  };

  const askChat = () => {
    const starterQuestion = buildChatPrompt(result);
    navigation.navigate('Chat', {
      starterQuestion,
      autoSend: true,
      scanResult: result,
      imageUri: image,
    });
  };

  const disabled = offline || loading;

  const diagnosis = result?.prediction || result?.label || 'Educational result';
  const adviceText = result && resultAdvice(result);
  const rawConfidence = typeof result?.confidence === 'number' ? Math.round(result.confidence * 100) : null;
  const displayedConfidence = rawConfidence !== null ? rawConfidence : null;
  const evidence = result?.evidence || result?.explanations || result?.explanation || result?.details || result?.features || result?.saliency || null;

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const renderHighlightedAdvice = (advice, diag) => {
    if (!advice) return advice;
    try {
      const re = new RegExp(`(${escapeRegExp(diag)})`, 'i');
      const parts = advice.split(re);
      return parts.map((part, i) => (
        re.test(part) ? (
          <Text key={i} style={styles.resultAdviceBold}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      ));
    } catch (e) {
      return advice;
    }
  };

  const buildChatPrompt = (scanData) => {
    const diagnosis = scanData?.diagnosis || scanData?.prediction || scanData?.label || 'an unclear condition';

    return `My scan result is ${diagnosis}.  Can you tell me what causes this,
     the symptoms, and how to prevent it?

Use educational language, do not diagnose, and include the standard disclaimer.`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Image Check</Text>
          <Text style={styles.subtitle}>Upload a mouth photo for an educational AI check</Text>
        </View>
        <DisclaimerBanner />
        <View style={[styles.uploadBox, offline && styles.offlineBox]}>
          {offline ? (
            <>
              <Ionicons name="cloud-offline-outline" size={34} color="#B84A3D" />
              <Text style={styles.offlineTitle}>You're offline - reconnect for a scan</Text>
              <TouchableOpacity style={styles.tryAgain} onPress={retryOnline}>
                <Text style={styles.tryAgainText}>Try again</Text>
              </TouchableOpacity>
            </>
          ) : image ? (
            <Image source={{ uri: image }} style={styles.preview} />
          ) : (
            <>
              <View style={styles.cameraIcon}>
                <Ionicons name="camera-outline" size={34} color="#2A9D8F" />
              </View>
              <Text style={styles.uploadTitle}>Add a clear photo</Text>
              <Text style={styles.uploadText}>Use good lighting and keep the area in focus.</Text>
            </>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, disabled && styles.disabledButton]}
            onPress={takePhoto}
            disabled={disabled}
            activeOpacity={0.85}
          >
            <Ionicons name="camera" size={18} color="#FFFFFF" />
            <Text style={styles.primaryText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, disabled && styles.disabledOutline]}
            onPress={pickImage}
            disabled={disabled}
            activeOpacity={0.85}
          >
            <Ionicons name="image-outline" size={18} color={disabled ? '#9AA7A4' : '#2A9D8F'} />
            <Text style={[styles.secondaryText, disabled && styles.disabledText]}>Upload</Text>
          </TouchableOpacity>
        </View>
        {loading ? <ActivityIndicator style={styles.loading} color="#2A9D8F" /> : null}
        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultKicker}>Analysis Result</Text>
            <Text style={styles.resultTitle}>{diagnosis}</Text>
            {displayedConfidence !== null ? (
              <Text style={styles.confidence}>Confidence: {displayedConfidence}%</Text>
            ) : null}
            {evidence ? (
              <View style={styles.evidenceBlock}>
                <Text style={styles.evidenceLabel}>Evidence from image</Text>
                <Text style={styles.evidenceText}>{typeof evidence === 'string' ? evidence : JSON.stringify(evidence)}</Text>
              </View>
            ) : null}
            {adviceText ? (
              <Text style={styles.resultAdvice}>{renderHighlightedAdvice(adviceText, diagnosis)}</Text>
            ) : null}
            <Text style={styles.resultCopy}>
              Not a diagnosis. Please confirm with a dentist. Results are generated by AI for
              informational purposes.
            </Text>
            <TouchableOpacity style={styles.chatButton} onPress={askChat} activeOpacity={0.85}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
              <Text style={styles.chatButtonText}>Ask Assistant</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF8' },
  container: { padding: 18, paddingBottom: 28, gap: 16 },
  header: { marginTop: 4 },
  title: { fontSize: 30, fontWeight: '800', color: '#183B38' },
  subtitle: { marginTop: 4, color: '#667A76', fontSize: 14 },
  uploadBox: {
    minHeight: 238,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#9ED5CD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    overflow: 'hidden',
  },
  offlineBox: { borderColor: '#E1A19A', backgroundColor: '#FFF7F3' },
  cameraIcon: {
    width: 70,
    height: 70,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7F5F2',
    marginBottom: 12,
  },
  uploadTitle: { color: '#183B38', fontSize: 18, fontWeight: '800' },
  uploadText: { color: '#667A76', fontSize: 14, marginTop: 6, textAlign: 'center' },
  offlineTitle: { color: '#B84A3D', fontSize: 15, fontWeight: '800', marginTop: 10, textAlign: 'center' },
  tryAgain: { marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  tryAgainText: { color: '#2A9D8F', fontWeight: '800' },
  preview: { width: '100%', height: 238, borderRadius: 14 },
  actions: { flexDirection: 'row', gap: 12 },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2A9D8F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderColor: '#2A9D8F',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryText: { color: '#2A9D8F', fontWeight: '800', fontSize: 15 },
  disabledButton: { backgroundColor: '#C8D2CF' },
  disabledOutline: { borderColor: '#D6DEDC' },
  disabledText: { color: '#9AA7A4' },
  loading: { marginTop: 8 },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6ECEA',
    padding: 18,
    gap: 8,
  },
  resultKicker: { color: '#2A9D8F', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  resultTitle: { color: '#183B38', fontSize: 22, fontWeight: '800' },
  confidence: { color: '#526A66', fontWeight: '700' },
  resultCopy: { color: '#526A66', fontSize: 14, lineHeight: 20 },
  chatButton: {
    marginTop: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2A9D8F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  chatButtonText: { color: '#FFFFFF', fontWeight: '800' },
  resultAdvice: { color: '#526A66', fontSize: 15, marginTop: 8 },
  resultAdviceBold: { color: '#526A66', fontSize: 15, marginTop: 8, fontWeight: '800' },
  evidenceBlock: { marginTop: 8, backgroundColor: '#F7FBFA', padding: 12, borderRadius: 10 },
  evidenceLabel: { color: '#2A9D8F', fontWeight: '800', marginBottom: 6 },
  evidenceText: { color: '#526A66', fontSize: 14 },
});
