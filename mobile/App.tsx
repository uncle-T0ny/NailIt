import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import NetInfo from '@react-native-community/netinfo';
import { fetchConnectionToken } from './src/utils/api';
import { flushQueue } from './src/utils/offlineQueue';
import { COLORS, DEMO_MODE } from './src/utils/config';
import type { RootStackParamList, TabParamList } from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import CollectPaymentScreen from './src/screens/CollectPaymentScreen';
import TapToPayScreen from './src/screens/TapToPayScreen';
import ReceiptScreen from './src/screens/ReceiptScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import UIKitScreen from './src/screens/UIKitScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function HomeIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HistoryIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Rect x="9" y="3" width="6" height="4" rx="1" stroke={color} strokeWidth="2" />
      <Path d="M9 12H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M9 16H13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: '#E5E7EB',
          paddingBottom: 20,
          paddingTop: 8,
          height: 76,
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarActiveTintColor: COLORS.orange,
        tabBarInactiveTintColor: COLORS.gray,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => <HistoryIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

// This component must be nested INSIDE StripeTerminalProvider
function AppNavigator() {
  // Watch connectivity for offline queue sync
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        flushQueue().catch(() => {});
      }
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.lightGray },
        }}
      >
        <Stack.Screen name="Main" component={HomeTabs} />
        <Stack.Screen
          name="CollectPayment"
          component={CollectPaymentScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="TapToPay"
          component={TapToPayScreen}
          options={{ animation: 'slide_from_right', gestureEnabled: false }}
        />
        <Stack.Screen
          name="Receipt"
          component={ReceiptScreen}
          options={{ animation: 'slide_from_right', gestureEnabled: false }}
        />
        {__DEV__ && (
          <Stack.Screen
            name="UIKit"
            component={UIKitScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  if (DEMO_MODE) {
    return <AppNavigator />;
  }

  return (
    <StripeTerminalProvider
      logLevel="verbose"
      tokenProvider={fetchConnectionToken}
    >
      <AppNavigator />
    </StripeTerminalProvider>
  );
}
