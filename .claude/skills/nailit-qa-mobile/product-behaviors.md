# NailIt Mobile App - Product Behaviors & Facts

Observed product behaviors, constraints, and quirks discovered during mobile QA testing. This file is updated automatically as new facts are discovered.

---

## Project Structure

- **Monorepo layout**: `mobile/` (React Native Expo app), `backend/` (Django project)
- **Mobile entry point**: `mobile/App.tsx` — wraps StripeTerminalProvider (non-demo) or bare NavigationContainer (demo)
- **Screen files**: `mobile/src/screens/` (5 main screens + UIKitScreen)
- **UI Components**: `mobile/src/components/` (8 reusable components with barrel export)
- **Mascot SVGs**: `mobile/src/mascot/` (11 Naily poses, animated with reanimated)
- **Utils**: `mobile/src/utils/` (api.ts, config.ts, offlineQueue.ts)

## Technology Stack

- **Expo SDK 55** with expo-dev-client for development builds
- **React Native 0.83.2** with TypeScript 5.9
- **React Navigation 7**: Native stack + bottom tabs
- **@stripe/stripe-terminal-react-native**: beta.29, Tap to Pay on iPhone
- **react-native-reanimated 4.2.1**: Mascot animations
- **react-native-svg 15.15.3**: SVG mascot rendering
- **AsyncStorage + NetInfo**: Offline queue persistence and connectivity detection

## Configuration

- **DEMO_MODE**: `true` by default in `mobile/src/utils/config.ts` — bypasses Stripe Terminal SDK, simulates tap-to-pay flow
- **API_URL**: `http://192.168.1.148:8000` — must match machine's local IP
- **Currency**: `cad` (Stripe account is Canadian region, `card_present` with `usd` errors)
- **STRIPE_LOCATION_ID**: `tml_GbemGgskI4LbKf`

## Navigation Behaviors

- **Tab bar**: 2 tabs (Home, History), height 76px with 20px bottom padding
- **Stack screens**: CollectPayment has native back button; TapToPay and Receipt disable swipe-back gesture
- **UIKit screen**: Hidden, accessible via 800ms long-press on NailIt logo (dev mode only)
- **Receipt "Done"**: Pops to top of stack (Home). "New Payment": Replaces current screen with CollectPayment

## Payment Flow (Demo Mode)

- **Simulated delays**: 1.5s connecting, 2s ready, 1.5s processing (~5 total)
- **Real backend calls**: Even in demo mode, PaymentIntent is created via real API and transaction is marked complete
- **Card details**: Always `visa •••• 4242` in demo mode
- **Offline fallback**: If backend PATCH fails after PI creation, transaction is queued in AsyncStorage

## Amount Entry

- **Numeric keypad**: 3x4 grid, amounts in dollars (displayed with $), sent to backend as cents
- **Validation**: Charge button disabled when amount is $0.00
- **Decimal**: Max 2 decimal places, single decimal point only
- **Backspace**: Removes last character, stops at "0"

## Offline Queue

- **Storage key**: `@nailit_offline_queue` in AsyncStorage
- **Deduplication**: Uses `stripe_payment_intent_id` to prevent duplicate sync
- **Auto-sync**: NetInfo listener in App.tsx flushes queue when connectivity returns
- **Manual sync**: "Sync Now" button in History screen offline banner
- **Banner**: Yellow warning banner appears in History when queue has items
