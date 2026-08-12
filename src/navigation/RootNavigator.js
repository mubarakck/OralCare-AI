import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from '../screens/ChatScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ImageCheckScreen from '../screens/ImageCheckScreen';
import InfoPageScreen from '../screens/InfoPageScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SettingsScreen from '../screens/SettingsScreen';

const DISCLAIMER_KEY = 'oralcare_disclaimer_accepted';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2A9D8F',
        tabBarInactiveTintColor: '#8A9A97',
        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopColor: '#DCE7E4',
          backgroundColor: '#FFFDF8',
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Chat: 'chatbubble-ellipses-outline',
            'Image Check': 'camera-outline',
            History: 'time-outline',
            Settings: 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Image Check" component={ImageCheckScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const [accepted, setAccepted] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(DISCLAIMER_KEY).then((value) => {
      setAccepted(value === 'true');
    });
  }, []);

  const handleAccepted = async () => {
    await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
    setAccepted(true);
  };

  if (accepted === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFDF8' }}>
        <ActivityIndicator color="#2A9D8F" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!accepted ? (
          <Stack.Screen name="Onboarding">
            {(props) => <OnboardingScreen {...props} onAccepted={handleAccepted} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
        <Stack.Screen name="Emergency" component={EmergencyScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Disclaimer" component={InfoPageScreen} />
        <Stack.Screen name="AboutApp" component={InfoPageScreen} />
        <Stack.Screen name="PrivacyPolicy" component={InfoPageScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
