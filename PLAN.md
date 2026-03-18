# NailIt — Tap to Pay Demo for Truss Interview

## Context

This is a demo project for an engineering interview at **Truss** (YC S21) — a banking and payments platform for construction companies. The goal is to show I can ship fast and understand both the domain and the tech.

**Interview:** March 19, 2026, 12–1pm with Matthew Smith (CEO) and Avery
**Deliverable:** Working iOS app + video demo sent before the interview

Truss already has Tap to Pay on iPhone in their live app (App Store, v1.3.2). This demo proves I can build the same core flow from scratch overnight.

---

## What Is Truss

- All-in-one banking + payments for construction contractors
- Tap to Pay on iPhone (no card reader hardware needed)
- Payment links, instant funds, corporate cards, QuickBooks sync
- No fees, no minimums
- YC S21, 12 people, Victoria BC / SF
- Stack: React / Django / PostgreSQL
- Banking via Thread Bank (FDIC)

---

## Demo Scope

A standalone React Native app with a Django backend that lets a contractor:
1. Pick a job template or type a custom description, enter a payment amount
2. Tap to collect card payment (Stripe Terminal, simulated)
3. See receipt with card details + send receipt to customer via Twilio SMS
4. View transaction history with QuickBooks-ready categories + CSV export
5. Works offline — queues payments locally and syncs when connectivity returns

5 screens, construction-themed UI, full Stripe Terminal integration, Twilio SMS receipts, offline-first resilience.

---

## Reference Implementation

Study this first: https://github.com/ArlanBiati/tap-to-pay-react-native-demo

It implements the 5-step Stripe Terminal flow:
1. `discoverReaders()` — find local mobile reader
2. `connectLocalMobileReader()` — connect with location ID
3. `createPaymentIntent()` — set amount + currency
4. `collectPaymentMethod()` — open Tap to Pay UI
5. `confirmPaymentIntent()` — finalize transaction

---

## Agent Prompt

```
Build a React Native (Expo) demo app called "NailIt" that implements Tap to Pay on iPhone using Stripe Terminal. This is a demo for a construction payments company interview — it should be clean, functional, and construction-themed.

The backend MUST be Django (Python) — this is intentional to demonstrate Django proficiency for a company that uses Django in production.

## Reference implementation
Clone and study https://github.com/ArlanBiati/tap-to-pay-react-native-demo first. Understand the 5-step payment flow: discoverReaders → connectLocalMobileReader → createPaymentIntent → collectPaymentMethod → confirmPaymentIntent.

## Tech stack
- React Native with Expo SDK (latest stable)
- TypeScript
- @stripe/stripe-terminal-react-native
- Django (Python) backend with Django REST Framework
- SQLite for demo simplicity (note PostgreSQL for production)
- EAS build for iOS development

## Project structure

/NailIt
  /mobile          — React Native Expo app
    /assets/mascot — Naily SVG poses (see Mascot section)
    /assets/icon   — App icon (Naily in hard hat)
  /backend         — Django project
  CLAUDE.md        — project context for AI agents
  PLAN.md          — this file (full implementation plan)
  README.md        — setup instructions

## Backend (Django)

### Setup:
- Django project called `nailit_backend`
- Django REST Framework for API endpoints
- django-cors-headers for mobile app access
- stripe Python SDK
- twilio Python SDK (for SMS receipts)
- python-dotenv for environment variables

### Models:
- Transaction:
  - amount: DecimalField (max_digits=10, decimal_places=2)
  - description: TextField (blank=True)
  - category: CharField (max_length=30, choices: labor/materials/subcontractor/equipment/other, default="labor")
  - card_last4: CharField (max_length=4, blank=True)
  - card_brand: CharField (max_length=20, blank=True)
  - status: CharField (choices: pending/completed/failed)
  - stripe_payment_intent_id: CharField (max_length=255, unique=True)
  - customer_phone: CharField (max_length=20, blank=True) — for SMS receipt
  - receipt_sent: BooleanField (default=False)
  - created_at: DateTimeField (auto_now_add)

- JobTemplate:
  - name: CharField (max_length=100) — e.g., "Framing", "Drywall", "Electrical"
  - default_category: CharField (max_length=30, choices same as Transaction.category)
  - usage_count: IntegerField (default=0) — for sorting by popularity
  - created_at: DateTimeField (auto_now_add)
  - Seed data: Framing, Drywall, Electrical, Plumbing, Roofing, Painting, Demolition, Concrete

### API endpoints:
- POST /api/connection-token/
  - Creates Stripe Terminal connection token
  - Returns: { secret: "..." }

- POST /api/payment-intents/
  - Body: { amount: 5000, currency: "usd", description: "Framing - 45 Elm St" }
  - Creates Stripe PaymentIntent with amount and metadata
  - Creates Transaction record with status "pending"
  - Returns: { client_secret: "...", id: "pi_..." }

- PATCH /api/transactions/<stripe_payment_intent_id>/complete/
  - Body: { card_last4: "4242", card_brand: "visa" }
  - Updates transaction status to "completed" with card details
  - Returns: serialized transaction

- GET /api/transactions/
  - Returns list of completed transactions, ordered by created_at desc
  - Include query param ?today=true to filter today only
  - Include query param ?category=labor to filter by category

- GET /api/transactions/export/
  - Returns CSV file of all transactions (or filtered by ?today=true, ?category=...)
  - Columns: date, amount, description, category, card_brand, card_last4, status, stripe_payment_intent_id
  - Content-Disposition header for file download
  - QuickBooks-compatible format (comment noting column mapping)

- POST /api/send-receipt/
  - Body: { transaction_id: "pi_...", phone: "+1234567890" }
  - Uses Twilio to send SMS receipt: "NailIt Receipt: $150.00 — Drywall install - 123 Oak St. Visa ****4242. Thank you!"
  - Updates transaction.customer_phone and transaction.receipt_sent = True
  - Returns: { success: true, message_sid: "SM..." }
  - Graceful error handling if Twilio fails (return error, don't crash)

- GET /api/job-templates/
  - Returns list of job templates ordered by usage_count desc
  - Used by CollectPaymentScreen for quick-tap chips

- GET /api/transactions/recent-descriptions/
  - Returns last 5 unique descriptions from completed transactions
  - Used by CollectPaymentScreen for "Recent" autocomplete section

- POST /api/offline-sync/
  - Body: { transactions: [ { amount, description, category, stripe_payment_intent_id, card_last4, card_brand, completed_at } ] }
  - Bulk-creates/updates transactions from offline queue
  - Idempotent — uses stripe_payment_intent_id to skip duplicates
  - Returns: { synced: 3, skipped: 1 }

### Django config:
- CORS: allow all origins for demo (comment noting production restriction)
- Stripe secret key from .env
- Twilio credentials from .env (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER)
- Register Transaction and JobTemplate models in admin with list_display
- No auth for demo (comment noting JWT/token auth for production)
- Management command `seed_templates` to populate JobTemplate with default data

### Admin:
- Register Transaction model so Django admin at /admin/ shows transaction records
- Register JobTemplate model with list_display (name, default_category, usage_count)
- This is part of the demo — shows full Django ecosystem comfort

## Mobile App (React Native / Expo)

### Screens:

1. **HomeScreen**
   - Header: "NailIt" logo/text + **Naily wave pose** beside it
   - Card: "Demo Construction Co." business name
   - Card: Today's total collected (GET /api/transactions/?today=true, sum amounts)
   - Big orange button: "Collect Payment"
   - Bottom tab: "History" link
   - Naily arm-wave animation on screen mount (one-shot)

2. **CollectPaymentScreen**
   - **Job templates row:** Horizontally scrollable chips fetched from GET /api/job-templates/
     - Tapping a chip fills in the description and auto-selects category
     - Chips: "Framing", "Drywall", "Electrical", "Plumbing", "Roofing", etc.
   - **Recent jobs:** Below chips, show last 5 unique descriptions from GET /api/transactions/recent-descriptions/
     - Tapping a recent job fills the description field
     - Styled as smaller, muted text pills
   - Large amount input with numeric keypad (custom, not system keyboard)
   - Dollar sign prefix, auto-format with decimals ($0.00)
   - Text input: job description (optional, placeholder: "e.g., Framing - 45 Elm St")
   - **Category picker:** Segmented control or dropdown — Labor, Materials, Subcontractor, Equipment, Other
     - Auto-selected when a job template is tapped, but user can override
   - Optional phone number input (placeholder: "Customer phone for receipt")
   - "Charge $XX.XX" button (disabled until amount > 0)
   - Back button to home

3. **TapToPayScreen**
   - On mount: discover reader → connect → create payment intent → collect payment method
   - States with Naily visual feedback:
     - "Connecting..." — **Naily working pose** (wobble animation) + spinner
     - "Ready — Tap or Insert Card" — **Naily tap pose** pointing at phone
     - "Processing..." — **Naily working pose** (wobble animation) + spinner
     - "Payment Failed" — **Naily error pose** (hard hat tilted) + retry button
   - Auto-advance to Receipt on success

4. **ReceiptScreen**
   - **Naily celebrate pose** with scale-bounce animation + confetti
   - "Payment Successful"
   - Amount in large font
   - Card info: "Visa •••• 4242"
   - Category badge (e.g., "Labor" in a colored pill)
   - Job description
   - Timestamp
   - On mount: PATCH transaction to "completed" in Django
   - **Send Receipt via SMS:** If customer phone was provided, show "Send Receipt" button
     - Calls POST /api/send-receipt/ with transaction ID and phone number
     - Shows "Sending..." spinner → "Receipt Sent!" confirmation with checkmark
     - If no phone provided, show "Send Receipt" button that prompts for phone number inline
   - After receipt sent: swap Naily to **thumbs-up pose**
   - Three buttons: "Send Receipt", "Done" (→ Home), and "New Payment" (→ CollectPayment)

5. **HistoryScreen**
   - Header: **Naily clipboard pose** beside "History" title
   - Fetch GET /api/transactions/ from Django
   - **Filter bar:** Segmented control to filter by category (All, Labor, Materials, Subcontractor, Equipment, Other)
   - FlatList of transactions: amount, description, category pill, card info, time
   - Pull-to-refresh
   - Empty state: **Naily shrug pose** (large, ~160px) + "No payments yet — go nail it!"
   - Each item shows status badge (completed = green, pending sync = orange)
   - **Export CSV button:** Top-right icon button — calls GET /api/transactions/export/ and triggers share sheet / download
     - Respects current category filter
   - **Offline queue indicator:** If there are queued offline transactions, show a banner at top with **Naily offline pose**: "X payments pending sync" + manual "Sync Now" button. While syncing, swap to **Naily syncing pose** with slide animation

### Stripe Terminal integration:

```typescript
// In root App.tsx
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';

const fetchTokenProvider = async () => {
  const response = await fetch(`${API_URL}/api/connection-token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const { secret } = await response.json();
  return secret;
};

// Wrap app:
<StripeTerminalProvider logLevel="verbose" tokenProvider={fetchTokenProvider}>
  <App />
</StripeTerminalProvider>
```

```typescript
// Payment flow in TapToPayScreen
const { discoverReaders, connectLocalMobileReader, createPaymentIntent,
        collectPaymentMethod, confirmPaymentIntent } = useStripeTerminal();

// Step 1: Discover
const { discoveredReaders } = await discoverReaders({
  discoveryMethod: 'localMobile',
  simulated: true, // Set false for real device
});

// Step 2: Connect
await connectLocalMobileReader({
  reader: discoveredReaders[0],
  locationId: STRIPE_LOCATION_ID,
});

// Step 3: Create PaymentIntent (via Django backend)
const response = await fetch(`${API_URL}/api/payment-intents/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: amountInCents, currency: 'usd', description }),
});
const { client_secret } = await response.json();

// Step 4: Collect
const { paymentIntent } = await collectPaymentMethod({ paymentIntent: client_secret });

// Step 5: Confirm
const { paymentIntent: confirmedIntent } = await confirmPaymentIntent({ paymentIntent });
```

### Navigation:
- React Navigation (native stack)
- HomeScreen and HistoryScreen as bottom tabs
- CollectPayment → TapToPay → Receipt as a stack flow

### Mascot — "Naily"

The app mascot is **Naily**: a friendly cartoon nail character wearing an orange hard hat, with expressive dot-eyes and small stick arms. Rounded body, metallic silver/gray color, flat head under the hard hat. Clean vector style — think Duolingo owl energy but construction-themed.

**Generate all poses as SVG files** in `/mobile/assets/mascot/`. Use `react-native-svg` to render them inline. Each pose should be ~120x120 default size, scalable.

#### Poses and where they appear:

| Pose | File | Description | Used in |
|------|------|-------------|---------|
| **wave** | `naily-wave.svg` | Waving with one arm, friendly smile | HomeScreen header, next to "NailIt" logo |
| **ready** | `naily-ready.svg` | Standing upright, arms on hips, confident | CollectPaymentScreen header |
| **tap** | `naily-tap.svg` | Pointing down at phone screen with one arm | TapToPayScreen — "Ready to tap" state |
| **working** | `naily-working.svg` | Spinning/hammering animation pose (tilted, motion lines) | TapToPayScreen — "Processing..." state |
| **celebrate** | `naily-celebrate.svg` | Both arms up, star/confetti burst around, big smile | ReceiptScreen — payment success |
| **thumbs-up** | `naily-thumbsup.svg` | One arm giving thumbs up, wink | ReceiptScreen — after "Receipt Sent!" |
| **clipboard** | `naily-clipboard.svg` | Holding a clipboard, reading glasses on | HistoryScreen header |
| **shrug** | `naily-shrug.svg` | Arms out, palms up, "nothing here" expression | HistoryScreen empty state — "No payments yet" |
| **offline** | `naily-offline.svg` | Holding a broken WiFi/signal icon, slight frown | Offline queue banner |
| **syncing** | `naily-syncing.svg` | Running/jogging pose with a sync-arrows icon | Offline sync in progress |
| **error** | `naily-error.svg` | Hard hat tilted, worried face, one hand on head | TapToPayScreen — "Payment Failed" state |

#### App Icon:
- **Naily's face in close-up** wearing the orange hard hat, on a dark navy (#1B2A4A) background
- Clean, recognizable at small sizes (1024x1024 source, iOS auto-scales)
- Place source at `/mobile/assets/icon/icon.png` and reference in app.json
- Also generate adaptive-icon foreground for completeness

#### Mascot animation:
- `naily-celebrate.svg`: Use `react-native-reanimated` to add a scale bounce (1.0 → 1.2 → 1.0) + confetti particle effect on mount
- `naily-working.svg`: Subtle continuous rotation or wobble animation (looping)
- `naily-wave.svg`: Gentle arm wave on HomeScreen mount (one-shot, 1 second)
- `naily-syncing.svg`: Continuous left-right slide animation while sync is in progress
- All other poses: static SVG, no animation needed

#### Mascot integration rules:
- Naily appears on EVERY screen — the mascot is the app's personality
- Keep mascot size proportional: ~80px in headers, ~120px in feature states, ~160px in empty states
- Mascot never overlaps interactive elements — always above or beside content
- Use the mascot to communicate state instead of generic spinners where possible

### UI/UX:
- Colors: dark navy (#1B2A4A), orange (#FF6B35), white, light gray (#F5F5F5), success green (#22C55E)
- Font: system default, bold headers
- Large tap targets — minimum 48px (contractors wear gloves)
- Amount display: 48px+ font size
- Loading states: Naily pose + text label at every async step (prefer mascot over generic spinners)
- Success: Naily celebrate pose with scale animation + green checkmark
- Card-based layout for dashboard items
- No unnecessary decoration — clean fintech aesthetic with personality from Naily

### Expo/EAS config (app.json):
```json
{
  "expo": {
    "name": "NailIt",
    "slug": "nailit",
    "version": "1.0.0",
    "orientation": "portrait",
    "ios": {
      "bundleIdentifier": "com.nailit.demo",
      "supportsTablet": false
    },
    "plugins": [
      [
        "@stripe/stripe-terminal-react-native",
        {
          "bluetoothBackgroundMode": true,
          "locationWhenInUsePermission": "Location access is required to accept payments.",
          "bluetoothPeripheralPermission": "Bluetooth access is required to connect to card readers.",
          "bluetoothAlwaysUsagePermission": "Bluetooth is used to connect to card readers.",
          "localNetworkUsagePermission": "Local network access is required for card readers.",
          "appDelegate": true,
          "tapToPayCheck": true
        }
      ]
    ]
  }
}
```

Build: `eas build --profile development --platform ios`
Run: `npx expo start --dev-client`

### Offline Payment Queue:
- Use AsyncStorage to persist a queue of transactions when backend is unreachable
- On app launch and on connectivity change (NetInfo), attempt to flush the queue
- Queue entry: { amount, description, category, stripe_payment_intent_id, card_last4, card_brand, customer_phone, created_at }
- Flow when offline:
  1. Payment still goes through Stripe Terminal (Stripe handles offline mode for the card tap)
  2. After confirmPaymentIntent succeeds, try PATCH to Django backend
  3. If PATCH fails (network error), save transaction to AsyncStorage queue
  4. Show receipt as normal but with an "Offline — will sync" note
- Sync logic:
  - On connectivity restored: POST /api/offline-sync/ with all queued transactions
  - On success: clear queue, update any visible UI
  - On partial failure: keep failed items in queue, retry later
  - Show sync status in HistoryScreen banner
- NetInfo listener in App.tsx root component to watch connectivity
- Manual "Sync Now" button in HistoryScreen as fallback

### Important implementation notes:
- Amount field: value in cents internally (1000 = $10.00), display formatted
- Don't cache connection tokens — SDK manages lifecycle
- Initialize StripeTerminalProvider in root, call initialize() from NESTED component (not same component)
- Location permission REQUIRED — Stripe Terminal won't work without it
- simulated: true for demo — shows full flow without real card
- Django backend on local network IP (not localhost) so physical iPhone can reach it
- Use ngrok or local IP (e.g., 192.168.x.x:8000) for mobile → backend connection

## Environment variables

### Backend (.env):
STRIPE_SECRET_KEY=sk_test_...
STRIPE_LOCATION_ID=tml_...
DJANGO_SECRET_KEY=your-django-secret
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...

### Mobile (.env or constants):
API_URL=http://192.168.x.x:8000 (or ngrok URL)
STRIPE_LOCATION_ID=tml_...

## Stripe setup (do this first):
1. Create Stripe account (or use existing test mode)
2. Create a Terminal Location via Stripe CLI:
   stripe terminal locations create --display-name "Demo Construction Co." --address-line1 "123 Main St" --address-city "Edmonton" --address-state "AB" --address-country "CA" --address-postal-code "T5J0N3"
3. Copy the location ID (tml_...) to both backend and mobile config
4. Get test API keys from Stripe Dashboard

## Deliverable:
Working app demoed on real iPhone via EAS development build. Video should show:
1. Open NailIt app → dashboard with today's total
2. Tap "Collect Payment" → tap "Drywall" job template chip (auto-fills description + category)
3. Enter $150.00, category auto-set to "Labor", optionally enter customer phone
4. Tap to Pay flow → simulated card tap → processing → success
5. Receipt screen with card details, category badge, and job description
6. Tap "Send Receipt" → SMS sent confirmation
7. Navigate to History → transaction appears with category pill + all details
8. Tap Export CSV → share sheet with QuickBooks-ready CSV
9. (Bonus) Toggle airplane mode → collect another payment → "Pending Sync" badge appears → toggle back → auto-sync
10. Quick flash of Django admin showing all transaction records

Total video length: 90-120 seconds. No narration needed — the flow speaks for itself.
```

---

## Setup Checklist

- [ ] Stripe test mode API keys (sk_test_..., pk_test_...)
- [ ] Create Terminal Location via Stripe CLI
- [ ] Apple Developer account with Tap to Pay entitlement
- [ ] Expo/EAS account for iOS builds
- [ ] Twilio account (free trial works) — get Account SID, Auth Token, and a phone number
- [ ] Run `python manage.py seed_templates` after initial migration

## Quick Start

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install django djangorestframework django-cors-headers stripe python-dotenv twilio
django-admin startproject nailit_backend .
python manage.py startapp payments
# ... configure settings, models, views, urls
python manage.py migrate
python manage.py seed_templates
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000

# Mobile
cd mobile
npx create-expo-app@latest . --template blank-typescript
npx expo install @stripe/stripe-terminal-react-native
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage @react-native-community/netinfo react-native-svg
eas build --profile development --platform ios
npx expo start --dev-client
```

---

## Acceptance Criteria

Every checkbox below must be completed before the demo is ready.

### Backend — Django

- [x] Django project `nailit_backend` runs with `python manage.py runserver 0.0.0.0:8000`
- [x] Transaction model with all fields: amount, description, category, card_last4, card_brand, status, stripe_payment_intent_id, customer_phone, receipt_sent, created_at
- [x] JobTemplate model with fields: name, default_category, usage_count, created_at
- [x] `seed_templates` management command creates 8 default job templates
- [x] `POST /api/connection-token/` — returns Stripe Terminal connection token
- [x] `POST /api/payment-intents/` — creates PaymentIntent + pending Transaction, accepts category field
- [x] `PATCH /api/transactions/<id>/complete/` — updates status to completed with card details
- [x] `GET /api/transactions/` — returns transactions, supports `?today=true` and `?category=` filters
- [x] `GET /api/transactions/export/` — returns CSV with QuickBooks-compatible columns, supports same filters
- [x] `POST /api/send-receipt/` — sends SMS via Twilio, updates customer_phone + receipt_sent
- [x] `GET /api/job-templates/` — returns templates ordered by usage_count desc
- [x] `GET /api/transactions/recent-descriptions/` — returns last 5 unique descriptions
- [x] `POST /api/offline-sync/` — bulk-creates transactions, idempotent on stripe_payment_intent_id
- [x] Transaction + JobTemplate registered in Django admin with list_display
- [x] CORS configured for all origins (with production note)
- [x] All env vars loaded from `.env` via python-dotenv

### Mobile — Screens & Navigation

- [x] React Navigation: bottom tabs (Home, History) + stack (CollectPayment → TapToPay → Receipt)
- [x] **HomeScreen**: NailIt header with Naily wave pose (animated), today's total card, "Collect Payment" button
- [x] **CollectPaymentScreen**: job template chips (scrollable), recent jobs pills, amount keypad, description input, category picker, phone input, "Charge" button
- [x] **TapToPayScreen**: full 5-step Stripe Terminal flow with Naily poses for each state (connecting, ready, processing, failed)
- [x] **ReceiptScreen**: Naily celebrate + confetti, amount, card info, category badge, description, timestamp, "Send Receipt" button (Twilio SMS), "Done" and "New Payment" buttons
- [x] **HistoryScreen**: Naily clipboard header, category filter bar, transaction list with category pills, status badges, pull-to-refresh, empty state with Naily shrug, Export CSV button, offline queue banner

### Mobile — Stripe Terminal

- [x] StripeTerminalProvider wraps app in root, tokenProvider calls Django
- [x] `discoverReaders` with `localMobile` discovery method
- [x] `connectLocalMobileReader` with location ID
- [x] `createPaymentIntent` via Django backend (includes category)
- [x] `collectPaymentMethod` opens Tap to Pay UI
- [x] `confirmPaymentIntent` finalizes transaction
- [x] `simulated: true` for demo mode

### Mobile — Twilio SMS Receipts

- [x] "Send Receipt" button on ReceiptScreen
- [x] If phone provided in CollectPayment, auto-shows send button
- [x] If no phone, inline prompt for phone number
- [x] Calls `POST /api/send-receipt/` with transaction ID + phone
- [x] Shows "Sending..." → "Receipt Sent!" with Naily thumbs-up transition
- [x] Graceful error handling if SMS fails

### Mobile — QuickBooks Categories & CSV Export

- [x] Category picker (segmented control) on CollectPaymentScreen: Labor, Materials, Subcontractor, Equipment, Other
- [x] Category auto-fills when job template chip is tapped
- [x] Category pill displayed on each transaction in HistoryScreen
- [x] Filter bar on HistoryScreen filters by category
- [x] Export CSV button triggers `GET /api/transactions/export/` → iOS share sheet
- [x] CSV export respects current category filter

### Mobile — Offline Payment Queue

- [x] AsyncStorage queue persists transactions when backend is unreachable
- [x] NetInfo listener in App.tsx watches connectivity
- [x] On offline: transaction saved to queue after successful Stripe confirm
- [x] Receipt shows "Offline — will sync" note with Naily offline pose
- [x] On connectivity restored: auto-flushes queue via `POST /api/offline-sync/`
- [x] HistoryScreen shows "X payments pending sync" banner with Naily offline pose
- [x] "Sync Now" manual button in banner
- [x] Syncing state shows Naily syncing pose with slide animation
- [x] Partial failures kept in queue for retry

### Mascot — Naily

- [x] 11 SVG poses generated: wave, ready, tap, working, celebrate, thumbs-up, clipboard, shrug, offline, syncing, error
- [x] App icon: Naily face close-up on dark navy background (1024x1024 source)
- [x] `naily-celebrate.svg` — scale bounce animation (1.0 → 1.2 → 1.0) + confetti on mount
- [x] `naily-working.svg` — continuous wobble/rotation animation (looping)
- [x] `naily-wave.svg` — arm wave on HomeScreen mount (one-shot, ~1s)
- [x] `naily-syncing.svg` — continuous left-right slide while syncing
- [x] Naily appears on every screen in appropriate pose
- [x] Mascot sizes: ~80px headers, ~120px feature states, ~160px empty states
- [x] Mascot never overlaps interactive elements

### UI/UX & Polish

- [x] Color palette: navy #1B2A4A, orange #FF6B35, white, gray #F5F5F5, green #22C55E
- [x] Large tap targets: minimum 48px (glove-friendly)
- [x] Amount display: 48px+ font
- [x] Custom numeric keypad (no system keyboard for amount)
- [x] Loading states use Naily poses instead of generic spinners
- [x] Card-based layout for dashboard items
- [x] Clean fintech aesthetic — no clutter

### Build & Deliverable

- [ ] `eas build --profile development --platform ios` succeeds
- [ ] App runs on physical iPhone via dev client
- [ ] Django backend accessible from iPhone (ngrok or local IP)
- [ ] Video recorded: 90-120 seconds covering all features (see Deliverable section)
- [ ] Video sent before March 19, 2026 12:00pm interview
