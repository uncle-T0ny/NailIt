import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { fetchConnectionToken } from './src/utils/api';
import { flushQueue } from './src/utils/offlineQueue';
import { COLORS } from './src/utils/config';
import type { RootStackParamList, TabParamList } from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import CollectPaymentScreen from './src/screens/CollectPaymentScreen';
import TapToPayScreen from './src/screens/TapToPayScreen';
import ReceiptScreen from './src/screens/ReceiptScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 12, fontWeight: focused ? '700' : '400', color: focused ? COLORS.orange : COLORS.gray }}>
      {label}
    </Text>
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
          paddingBottom: 4,
          height: 56,
        },
        tabBarActiveTintColor: COLORS.orange,
        tabBarInactiveTintColor: COLORS.gray,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text>,
          tabBarLabel: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📋</Text>,
          tabBarLabel: ({ focused }) => <TabIcon label="History" focused={focused} />,
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <StripeTerminalProvider
      logLevel="verbose"
      tokenProvider={fetchConnectionToken}
    >
      <AppNavigator />
    </StripeTerminalProvider>
  );
}
