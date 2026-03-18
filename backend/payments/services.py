import logging
from decimal import Decimal

import stripe
from django.conf import settings
from django.utils import timezone
from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client as TwilioClient

from .models import Transaction

logger = logging.getLogger('payments')

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_connection_token():
    """Create a Stripe Terminal connection token."""
    token = stripe.terminal.ConnectionToken.create()
    logger.info('Connection token created')
    return token.secret


def create_payment(amount_cents, currency, description, category):
    """Create a Stripe PaymentIntent and a pending Transaction.

    Returns (intent, transaction) tuple.
    """
    intent = stripe.PaymentIntent.create(
        amount=int(amount_cents),
        currency=currency,
        payment_method_types=['card_present'],
        capture_method='automatic',
        metadata={'description': description, 'category': category},
    )

    txn = Transaction.from_cents(
        amount_cents=amount_cents,
        description=description,
        category=category,
        status='pending',
        stripe_payment_intent_id=intent.id,
    )
    txn.save()

    logger.info('PaymentIntent %s created for %d cents', intent.id, amount_cents)
    return intent, txn


def complete_transaction(payment_intent_id, card_last4='', card_brand=''):
    """Mark a transaction as completed with card details.

    Raises Transaction.DoesNotExist if not found.
    """
    txn = Transaction.objects.get(stripe_payment_intent_id=payment_intent_id)
    txn.card_last4 = card_last4
    txn.card_brand = card_brand
    txn.status = 'completed'
    txn.save()

    logger.info('Transaction %s completed', payment_intent_id)
    return txn


def get_filtered_transactions(today=False, category=None):
    """Return completed transactions with optional filters."""
    qs = Transaction.objects.filter(status='completed')

    if today:
        qs = qs.filter(created_at__date=timezone.now().date())

    if category:
        qs = qs.filter(category=category)

    return qs


def send_sms_receipt(transaction, phone):
    """Send an SMS receipt via Twilio.

    Returns the Twilio message SID.
    Raises TwilioRestException on failure.
    """
    card_info = (
        f"{transaction.card_brand.title()} ****{transaction.card_last4}"
        if transaction.card_last4
        else "Card"
    )
    body = (
        f"NailIt Receipt: ${transaction.amount:.2f} — "
        f"{transaction.description or 'Payment'}. {card_info}. Thank you!"
    )

    client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    message = client.messages.create(
        body=body,
        from_=settings.TWILIO_FROM_NUMBER,
        to=phone,
    )

    transaction.customer_phone = phone
    transaction.receipt_sent = True
    transaction.save()

    logger.info('Receipt sent for transaction %s to %s', transaction.stripe_payment_intent_id, phone)
    return message.sid


def sync_offline_batch(transactions_data):
    """Bulk-create/update transactions from offline queue. Idempotent.

    Returns (synced_count, skipped_count) tuple.
    """
    synced = 0
    skipped = 0

    for txn_data in transactions_data:
        pi_id = txn_data.get('stripe_payment_intent_id')
        if not pi_id:
            continue

        _, created = Transaction.objects.update_or_create(
            stripe_payment_intent_id=pi_id,
            defaults={
                'amount': Decimal(str(txn_data.get('amount', 0))) / 100,
                'description': txn_data.get('description', ''),
                'category': txn_data.get('category', 'labor'),
                'card_last4': txn_data.get('card_last4', ''),
                'card_brand': txn_data.get('card_brand', ''),
                'status': 'completed',
            },
        )
        if created:
            synced += 1
        else:
            skipped += 1

    logger.info('Offline sync: %d synced, %d skipped', synced, skipped)
    return synced, skipped
