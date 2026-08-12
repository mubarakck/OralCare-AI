import NetInfo from '@react-native-community/netinfo';
import { CONFIG } from './config';

export const isOnline = async () => {
  try {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      return false;
    }

    if (state.isInternetReachable === null) {
      return true;
    }

    return !!state.isInternetReachable;
  } catch (error) {
    console.warn('Network reachability check failed:', error);
    return true;
  }
};

const CHAT_TIMEOUT_MS = 180000;
const MAX_HISTORY_TURNS = 6;

export const askOralAI = async (message, history = [], context = {}) => {
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (!trimmedMessage) {
    return {
      text: 'Please enter a question so I can help you.',
      isEmergency: false,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

  try {
    const bodyPayload = {
      message: trimmedMessage,
      text: trimmedMessage,
      context,
      history: history.slice(-MAX_HISTORY_TURNS),
    };

    const response = await fetch(`${CONFIG.API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      let detail = '';
      try {
        const errorData = await response.json();
        detail = errorData?.detail
          ? typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail)
          : '';
      } catch {
        detail = '';
      }

      if (response.status === 503 || response.status === 502 || response.status === 504) {
        return {
          text: 'The assistant is still waking up. Please wait a moment and try again.',
          isEmergency: false,
        };
      }

      return {
        text: detail || 'The assistant could not answer right now. Please try again in a moment.',
        isEmergency: false,
      };
    }

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!data || typeof data !== 'object') {
      return {
        text: 'The assistant could not answer right now. Please try again in a moment.',
        isEmergency: false,
      };
    }

    return {
      text: data.response ?? data.message ?? 'I could not generate a response right now.',
      isEmergency: !!data.is_emergency,
    };
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      return {
        text: 'The assistant is still waking up. Please wait up to 2 minutes and try again.',
        isEmergency: false,
      };
    }
    console.error('Chat request failed:', error);
    return {
      text: 'Connection error. Please check your internet and try again.',
      isEmergency: false,
    };
  }
};

export const predictDisease = async (imageUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  });

  try {
    const response = await fetch(`${CONFIG.API_URL}/predict`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    console.log('PREDICT RESPONSE:', JSON.stringify(data));  // <-- temporary, check console
    return data;
  } catch (error) {
    console.error('Scan error:', error);
    return null;
  }
};
