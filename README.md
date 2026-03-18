# NailIt

Tap to Pay on iPhone demo for a Truss (YC S21) engineering interview. Complete payments flow: Django backend + React Native frontend with Stripe Terminal integration.

## Quick Start

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install django djangorestframework django-cors-headers stripe python-dotenv twilio
cp .env.example .env  # Fill in your keys
python manage.py migrate
python manage.py seed_templates
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

### Mobile

```bash
cd mobile
npm install
npx expo start --dev-client
```

### EAS Build (iOS)

```bash
cd mobile
eas build --profile development --platform ios
```

## Tech Stack

- **Backend:** Django + DRF, SQLite, Stripe Python SDK, Twilio
- **Mobile:** React Native (Expo), TypeScript, Stripe Terminal, React Navigation
- **Features:** Tap to Pay, SMS receipts, offline queue, CSV export, job templates

## Credits

Logo generated using [Quiver](https://app.quiver.ai/)
