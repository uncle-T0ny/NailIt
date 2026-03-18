# NailIt

Tap to Pay on iPhone demo for a Truss (YC S21) engineering interview. Proves ability to ship a complete payments flow overnight — from Django backend to React Native frontend with Stripe Terminal integration.

## Tech Stack

### Backend
- **Django** + Django REST Framework (Truss uses Django in production)
- **SQLite** for demo (PostgreSQL in production)
- **Stripe Python SDK** — PaymentIntent creation, Terminal connection tokens
- **Twilio Python SDK** — SMS receipt delivery
- **python-dotenv** — environment variable management

### Mobile
- **React Native** with **Expo SDK** (latest stable)
- **TypeScript**
- **@stripe/stripe-terminal-react-native** — Tap to Pay on iPhone
- **React Navigation** — native stack + bottom tabs
- **react-native-svg** — Naily mascot rendering
- **react-native-reanimated** — mascot animations (bounce, wobble, slide)
- **@react-native-async-storage/async-storage** — offline payment queue
- **@react-native-community/netinfo** — connectivity detection for offline sync

### Build
- **EAS Build** — iOS development builds
- **Expo Dev Client** — development runtime

## Project Structure

```
/NailIt
  /mobile                — React Native Expo app
    /assets/mascot       — Naily SVG poses (11 files)
    /assets/icon         — App icon (Naily face on navy bg)
  /backend               — Django project (nailit_backend)
    /payments            — Django app with models, views, urls
  CLAUDE.md              — this file
  PLAN.md                — full implementation plan + acceptance criteria
```

## Key Architecture Decisions

- **Django backend is intentional** — not overkill for a demo. Truss runs Django in production; this proves proficiency.
- **SQLite for demo** — no need for PostgreSQL complexity in a demo. Code comments note PostgreSQL for production.
- **Simulated Stripe Terminal** — `simulated: true` shows the full Tap to Pay flow without needing a real card. Set to `false` for production.
- **Offline-first queue** — AsyncStorage + NetInfo. Construction sites have poor connectivity; this is a domain-aware decision.
- **StripeTerminalProvider in root** — `initialize()` must be called from a NESTED component, not the same component that renders the provider.
- **No auth** — demo simplicity. Comments note where JWT/token auth would go in production.

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/connection-token/` | Stripe Terminal connection token |
| POST | `/api/payment-intents/` | Create PaymentIntent + pending Transaction |
| PATCH | `/api/transactions/<id>/complete/` | Mark transaction completed with card details |
| GET | `/api/transactions/` | List transactions (?today, ?category filters) |
| GET | `/api/transactions/export/` | CSV download (QuickBooks-compatible) |
| POST | `/api/send-receipt/` | Send SMS receipt via Twilio |
| GET | `/api/job-templates/` | Job template chips for quick entry |
| GET | `/api/transactions/recent-descriptions/` | Last 5 unique job descriptions |
| POST | `/api/offline-sync/` | Bulk sync offline-queued transactions |

## Environment Variables

### Backend (.env)
- `STRIPE_SECRET_KEY` — Stripe test mode secret key
- `STRIPE_LOCATION_ID` — Stripe Terminal location ID
- `DJANGO_SECRET_KEY` — Django secret
- `TWILIO_ACCOUNT_SID` — Twilio account SID
- `TWILIO_AUTH_TOKEN` — Twilio auth token
- `TWILIO_FROM_NUMBER` — Twilio sending phone number

### Mobile
- `API_URL` — Django backend URL (ngrok or local IP like `http://192.168.x.x:8000`)
- `STRIPE_LOCATION_ID` — same Terminal location ID

## Mascot — "Naily"

Cartoon nail character with orange hard hat. 11 SVG poses used throughout the app to communicate state (wave, ready, tap, working, celebrate, thumbs-up, clipboard, shrug, offline, syncing, error). Animated poses: celebrate (bounce + confetti), working (wobble), wave (one-shot), syncing (slide). See PLAN.md for full pose table.

## Conventions

- Amount stored in cents internally (1000 = $10.00), formatted for display
- Transaction categories: labor, materials, subcontractor, equipment, other
- All API responses are JSON except CSV export
- Offline sync is idempotent — uses stripe_payment_intent_id to deduplicate
- Naily appears on every screen — mascot is the app's visual identity
