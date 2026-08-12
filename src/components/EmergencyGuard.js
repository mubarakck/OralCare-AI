const EMERGENCY_KEYWORDS = [
  "can't stop bleeding",
  'cannot stop bleeding',
  'bleeding will not stop',
  'severe swelling',
  'swelling that affects breathing',
  'difficulty breathing',
  'trouble breathing',
  'knocked out tooth',
  'tooth knocked out',
  'sudden tooth loss',
  'trauma',
  'facial trauma',
  'jaw injury',
];

export const containsEmergencyKeyword = (...values) => {
  const text = values.filter(Boolean).join(' ').toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => text.includes(keyword));
};

export const triggerEmergencyIfNeeded = (
  navigation,
  { backendFlag = false, userMessage = '', adviceText = '' } = {}
) => {
  if (backendFlag || containsEmergencyKeyword(userMessage, adviceText)) {
    navigation.navigate('Emergency');
    return true;
  }
  return false;
};
