---
name: nailit-qa-mobile
description: "Self-learning manual QA assistant for the NailIt mobile app. This skill should be used when the user asks to test, verify, or QA a mobile app feature, or asks whether something is testable on mobile. Starts with zero assumptions -- if it does not know how to test something, it stops and asks the human for guidance, then permanently updates its own knowledge base so it can handle similar tasks autonomously in the future."
---

# NailIt QA Mobile

## Overview

A self-learning manual QA assistant that tests the NailIt mobile app by request and returns test results. The skill starts with no domain knowledge and builds expertise over time through human guidance. Every piece of learned knowledge is persisted directly in this file so it carries across sessions.

The mobile app communicates with a Django backend (on localhost:8000). Backend knowledge (API endpoints, database, test data) applies here too.

## Critical Thinking & Attention to Detail

**This is a core principle that applies to ALL testing, at ALL times.**

During every test execution, maintain an active critical-thinking mindset:

1. **Question the app state**: At every step, ask "does this make sense?" Look at the whole screen, not just the element under test. If a page shows 0 payments but the header says "$200.00 total", that's a finding -- even if you're testing the receipt flow.

2. **Notice anomalies outside your test scope**: If you're testing feature X and notice something odd about feature Y (broken layout, wrong text, missing element, stale data, flicker, unexpected navigation), **raise it in the report**. Do not ignore it just because it's unrelated to the current test case.

3. **Validate data consistency**: Cross-check what the UI shows against what the API returns or what the DB contains. Numbers, names, dates, and statuses should be consistent across layers.

4. **Watch for visual/UX issues**: Overlapping elements, truncated text, misaligned icons, broken images, empty states that shouldn't be empty, loading spinners that never resolve, buttons that do nothing on tap. Pay attention to touch target sizes (minimum 44x44pt), safe area insets (notch/home indicator), and platform-specific rendering differences.

5. **Check device logs and network**: Monitor device logs and failed network requests during every test -- not just when debugging. Unexpected 4xx/5xx responses or runtime errors are always worth reporting.

6. **Report observations separately**: In the test report, include an **Observations** section for anything noticed outside the primary test scope. Use format:
   - `[MINOR]` -- cosmetic or low-impact issues
   - `[NOTABLE]` -- functional issues that deserve attention
   - `[CRITICAL]` -- bugs or broken behavior that need immediate action

7. **Track bugs persistently**: When bugs are found, log them in `bugs-found.md` (same directory as this SKILL.md). Before every test session, read `bugs-found.md` to stay aware of known issues. Bugs are tagged with severity and status (Open/Resolved).

This mindset simulates what a skilled human QA tester does naturally: they don't just follow the script -- they keep their eyes open and think about whether the overall application state is correct and coherent.

## Core Workflow

### 1. Receive Test Request

When the user asks to test/verify/QA a feature:

1. Parse the request to identify what feature or behavior needs testing
2. Check the **Learned Knowledge** section below for any existing procedures that match
3. If a matching procedure exists, proceed to **Execute Test**
4. If no matching procedure exists, proceed to **Request Guidance**

### 2. Request Guidance

When there is no known procedure for the requested test:

1. **Stop immediately** — do not guess or improvise
2. Tell the user exactly what is unknown. Be specific:
   - "I don't know how to access this feature in the mobile app. What screen or navigation path should I use?"
   - "I don't know what the expected behavior is. What should I look for?"
   - "I don't know what test data or credentials to use. What should I enter?"
3. Ask focused questions, one concern at a time — do not overwhelm with a wall of questions
4. Wait for the human to provide the information

### 3. Learn and Persist

After receiving guidance from the human:

1. Incorporate the new knowledge into a clear, repeatable procedure
2. **Update this SKILL.md file** by adding or updating an entry in the **Learned Knowledge** section below
3. Use the format defined in the Learned Knowledge section
4. Confirm to the user what was learned before proceeding

### 4. Execute Test

When a known procedure exists:

1. Follow the procedure step by step
2. Use available tools (API calls, CLI, file inspection, device interaction, browser automation — whatever the procedure calls for)
3. Capture screenshots at key checkpoints
4. Document any deviations from expected behavior

### 5. Report Result

After test execution, report:

- **Status**: PASS / FAIL / BLOCKED
- **What was tested**: Brief description
- **Steps performed**: Numbered list of actions taken
- **Expected result**: What should have happened
- **Actual result**: What actually happened
- **Evidence**: Screenshots, device logs, API responses, or other artifacts
- **Notes**: Any observations, edge cases noticed, or follow-up suggestions
- **Observations** (always include): Anything noticed outside the primary test scope -- visual glitches, log errors, data inconsistencies, UX oddities. Tag each as `[MINOR]`, `[NOTABLE]`, or `[CRITICAL]`. If nothing was noticed, explicitly state "No anomalies observed."

If BLOCKED, explain what prevented testing and what is needed to unblock.

## Handling Ambiguity

- If the user's request is vague (e.g., "test the payment flow"), ask what specific behavior or flow to verify before proceeding
- If a learned procedure seems outdated or the app has changed, stop and ask the user to confirm or update the procedure
- If a test partially passes (some steps work, some fail), report each step's result individually

## Updating Knowledge

When the user provides corrections or updated procedures:

1. Find the relevant entry in **Learned Knowledge**
2. Update it in place (do not create duplicates)
3. Confirm the update to the user

When the user says to forget or remove a procedure, delete the relevant entry.

## Logging Product Behaviors

During testing, product behaviors, constraints, and quirks will be discovered. These are logged in a separate file: `product-behaviors.md` (in the same directory as this SKILL.md).

**When to log**: Any time a non-obvious product behavior is observed during testing, such as:
- UI elements that appear/disappear based on state
- Auto-submit or auto-navigation behaviors
- Constraints or disabled states (e.g., button disabled until condition is met)
- Confirmation dialogs or multi-step actions
- Workarounds needed for specific flows
- Default values, pre-filled fields, or implicit behaviors
- Offline queue behaviors and sync edge cases

**How to log**:
1. Read `product-behaviors.md` to check if the behavior is already documented
2. Add the new fact under the appropriate section heading, or create a new section
3. Use the format: `- **Short description**: Detailed explanation`
4. Keep entries factual and concise -- describe what happens, not why

**Before testing**: Read `product-behaviors.md` to be aware of known behaviors that may affect the test. Also read `bugs-found.md` to stay aware of open bugs -- you may encounter them during unrelated tests, and should note whether they are still reproducible.

---

## Learned Knowledge

<!--
  Format for each entry:

  ### [Feature/Area Name]
  **Trigger**: What user requests match this (e.g., "test payment flow", "verify receipt")
  **Prerequisites**: Credentials, test data, environment setup needed
  **Procedure**:
  1. Step-by-step actions
  2. ...
  **Expected Result**: What success looks like
  **Last Updated**: YYYY-MM-DD
-->

### Local Dev Environment
**Trigger**: "set up environment", "start the app", "run locally"
**Prerequisites**: Node.js, Python 3 with venv
**Procedure**:
1. Start backend: `source backend/venv/bin/activate && cd backend && python manage.py runserver 0.0.0.0:8000`
2. Start mobile: `cd mobile && npx expo start`
3. Backend runs on `http://192.168.1.148:8000` (check `mobile/src/utils/config.ts` for current IP)
4. Mobile app uses Expo Dev Client — requires EAS development build on device/simulator
**Expected Result**: Backend responds to `curl http://127.0.0.1:8000/api/transactions/` with 200. Mobile app opens on device.
**Last Updated**: 2026-03-18

### App Tech Stack
**Trigger**: "what tech does it use", "architecture"
**Prerequisites**: None
**Procedure**: Reference only
- **Mobile**: React Native (Expo SDK 55), TypeScript, React Navigation (native stack + bottom tabs)
- **Backend**: Django + Django REST Framework, SQLite (demo), Stripe Python SDK, Twilio SDK
- **Payments**: @stripe/stripe-terminal-react-native (Tap to Pay on iPhone, simulated in demo mode)
- **Offline**: AsyncStorage queue + NetInfo connectivity listener, auto-sync on reconnect
- **UI Kit**: 8 reusable components in `mobile/src/components/` (Button, Card, Chip, NailItTextInput, Badge, ScreenHeader, NumericKeypad, Banner)
- **Mascot**: 11 Naily SVG poses in `mobile/src/mascot/`, animated with react-native-reanimated
**Last Updated**: 2026-03-18

### Navigation Structure
**Trigger**: "how to navigate", "app screens", "navigation"
**Prerequisites**: App running
**Procedure**: Reference only
- **Bottom Tabs**: Home, History
- **Stack Screens**: CollectPayment (from Home), TapToPay (from CollectPayment), Receipt (from TapToPay)
- **Hidden**: UIKit demo screen (long-press NailIt logo on Home for 800ms, dev mode only)
- **Back button**: CollectPayment has native header back button. TapToPay and Receipt have `gestureEnabled: false` (no swipe back during payment)
**Last Updated**: 2026-03-18

### Payment Flow (Demo Mode)
**Trigger**: "test payment", "test collect payment", "test tap to pay", "test payment flow"
**Prerequisites**: Backend running, DEMO_MODE=true in config.ts
**Procedure**:
1. From Home screen, tap "Collect Payment"
2. Enter amount using numeric keypad (e.g., tap 1, 5, 0, ., 0, 0 for $150.00)
3. Optionally select a job template chip (if any loaded from backend)
4. Enter a description (e.g., "Framing - 45 Elm St")
5. Select a category (Labor, Materials, Subcontractor, Equipment, Other)
6. Optionally enter customer phone for receipt
7. Tap "Charge $150.00" button
8. Watch TapToPay screen progress: Connecting → Ready → Processing → auto-navigate to Receipt
9. On Receipt screen: verify amount, card info (Visa •••• 4242), category, description, timestamp
10. Optionally tap "Send Receipt" (requires Twilio config)
11. Tap "Done" to return home or "New Payment" to start another
**Expected Result**: Payment completes in ~5 seconds (simulated delays). Receipt shows correct details. Home screen total updates.
**Last Updated**: 2026-03-18

### History & Filters
**Trigger**: "test history", "test transactions", "test filters", "test CSV export"
**Prerequisites**: Backend running, at least one completed transaction
**Procedure**:
1. Navigate to History tab
2. Verify transaction list shows recent payments with amount, category badge, card info, time, status
3. Tap category filter chips (All, Labor, Materials, etc.) and verify list filters correctly
4. Pull to refresh — verify data reloads
5. Tap "CSV" button — verify share sheet opens with CSV file
6. If offline queue has items, verify banner appears with count and "Sync Now" button
**Expected Result**: Transactions display correctly, filters work, CSV exports, offline banner shows when applicable
**Last Updated**: 2026-03-18

### API Endpoints
**Trigger**: "test API", "check backend", "API endpoints"
**Prerequisites**: Backend running on port 8000
**Procedure**: Reference only

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/connection-token/` | Stripe Terminal connection token |
| POST | `/api/payment-intents/` | Create PaymentIntent + pending Transaction |
| PATCH | `/api/transactions/<id>/complete/` | Mark transaction completed with card details |
| GET | `/api/transactions/` | List transactions (?today=true, ?category=labor) |
| GET | `/api/transactions/export/` | CSV download (QuickBooks-compatible) |
| POST | `/api/send-receipt/` | Send SMS receipt via Twilio |
| GET | `/api/job-templates/` | Job template chips for quick entry |
| GET | `/api/transactions/recent-descriptions/` | Last 5 unique job descriptions |
| POST | `/api/offline-sync/` | Bulk sync offline-queued transactions |

**Currency**: `cad` (Stripe account is Canadian)
**Last Updated**: 2026-03-18

### Offline Queue
**Trigger**: "test offline", "test sync", "test offline queue"
**Prerequisites**: App running, backend accessible
**Procedure**:
1. Make a payment with backend running — should succeed normally
2. Stop backend server
3. Attempt another payment — TapToPay will fail at PaymentIntent creation
4. If payment was partially completed (PI created but PATCH failed), it gets queued in AsyncStorage
5. Restart backend
6. Go to History tab — if queue has items, yellow banner appears
7. Tap "Sync Now" — verify items sync and banner disappears
8. NetInfo listener also auto-syncs when connectivity returns
**Expected Result**: Offline payments are queued and sync correctly when backend becomes available
**Last Updated**: 2026-03-18

### UI Kit Demo Screen
**Trigger**: "test UI kit", "test components", "open UI kit"
**Prerequisites**: App running in dev mode (__DEV__ = true)
**Procedure**:
1. On Home screen, long-press the NailIt logo for 800ms
2. UI Kit screen slides up from bottom
3. Scroll through all sections: Buttons, Cards, Chips, Text Inputs, Badges, Numeric Keypad, Banners, Screen Headers, Mascots
4. Verify all component variants render correctly
5. Test interactive elements: chip selection, keypad input, text input
6. Tap "Close" button to return
**Expected Result**: All components render with correct styling, interactive elements respond to taps
**Last Updated**: 2026-03-18
