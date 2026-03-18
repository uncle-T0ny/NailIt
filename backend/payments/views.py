import csv
from decimal import Decimal

import stripe
from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from twilio.rest import Client as TwilioClient

from .models import Transaction, JobTemplate
from .serializers import TransactionSerializer, JobTemplateSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
def connection_token(request):
    """Create a Stripe Terminal connection token."""
    try:
        token = stripe.terminal.ConnectionToken.create()
        return Response({'secret': token.secret})
    except stripe.StripeError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_payment_intent(request):
    """Create a PaymentIntent + pending Transaction."""
    amount = request.data.get('amount')  # in cents
    currency = request.data.get('currency', 'usd')
    description = request.data.get('description', '')
    category = request.data.get('category', 'labor')

    if not amount or int(amount) <= 0:
        return Response({'error': 'Amount must be positive'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        intent = stripe.PaymentIntent.create(
            amount=int(amount),
            currency=currency,
            payment_method_types=['card_present'],
            capture_method='automatic',
            metadata={'description': description, 'category': category},
        )

        Transaction.objects.create(
            amount=Decimal(int(amount)) / 100,
            description=description,
            category=category,
            status='pending',
            stripe_payment_intent_id=intent.id,
        )

        return Response({
            'client_secret': intent.client_secret,
            'id': intent.id,
        })
    except stripe.StripeError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
def complete_transaction(request, payment_intent_id):
    """Mark a transaction as completed with card details."""
    try:
        txn = Transaction.objects.get(stripe_payment_intent_id=payment_intent_id)
    except Transaction.DoesNotExist:
        return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

    txn.card_last4 = request.data.get('card_last4', '')
    txn.card_brand = request.data.get('card_brand', '')
    txn.status = 'completed'
    txn.save()

    return Response(TransactionSerializer(txn).data)


@api_view(['GET'])
def list_transactions(request):
    """List transactions with optional filters."""
    qs = Transaction.objects.filter(status='completed')

    if request.query_params.get('today') == 'true':
        today = timezone.now().date()
        qs = qs.filter(created_at__date=today)

    category = request.query_params.get('category')
    if category:
        qs = qs.filter(category=category)

    return Response(TransactionSerializer(qs, many=True).data)


@api_view(['GET'])
def export_transactions(request):
    """Export transactions as QuickBooks-compatible CSV."""
    qs = Transaction.objects.filter(status='completed')

    if request.query_params.get('today') == 'true':
        today = timezone.now().date()
        qs = qs.filter(created_at__date=today)

    category = request.query_params.get('category')
    if category:
        qs = qs.filter(category=category)

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="nailit_transactions.csv"'

    # QuickBooks-compatible columns: Date, Description, Amount, Category map to
    # Date, Memo, Amount, Class in QuickBooks import
    writer = csv.writer(response)
    writer.writerow(['Date', 'Amount', 'Description', 'Category', 'Card Brand', 'Card Last4', 'Status', 'Stripe Payment Intent ID'])
    for txn in qs:
        writer.writerow([
            txn.created_at.strftime('%Y-%m-%d %H:%M'),
            f'{txn.amount:.2f}',
            txn.description,
            txn.category,
            txn.card_brand,
            txn.card_last4,
            txn.status,
            txn.stripe_payment_intent_id,
        ])

    return response


@api_view(['POST'])
def send_receipt(request):
    """Send SMS receipt via Twilio."""
    transaction_id = request.data.get('transaction_id')
    phone = request.data.get('phone')

    if not transaction_id or not phone:
        return Response({'error': 'transaction_id and phone are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        txn = Transaction.objects.get(stripe_payment_intent_id=transaction_id)
    except Transaction.DoesNotExist:
        return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

    card_info = f"{txn.card_brand.title()} ****{txn.card_last4}" if txn.card_last4 else "Card"
    body = f"NailIt Receipt: ${txn.amount:.2f} — {txn.description or 'Payment'}. {card_info}. Thank you!"

    try:
        client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=body,
            from_=settings.TWILIO_FROM_NUMBER,
            to=phone,
        )
        txn.customer_phone = phone
        txn.receipt_sent = True
        txn.save()
        return Response({'success': True, 'message_sid': message.sid})
    except Exception as e:
        return Response({'error': f'SMS failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def job_templates(request):
    """Return job templates ordered by usage count."""
    templates = JobTemplate.objects.all()
    return Response(JobTemplateSerializer(templates, many=True).data)


@api_view(['GET'])
def recent_descriptions(request):
    """Return last 5 unique descriptions from completed transactions."""
    descriptions = (
        Transaction.objects
        .filter(status='completed')
        .exclude(description='')
        .values_list('description', flat=True)
        .distinct()[:5]
    )
    return Response(list(descriptions))


@api_view(['POST'])
def offline_sync(request):
    """Bulk-create/update transactions from offline queue. Idempotent."""
    transactions = request.data.get('transactions', [])
    synced = 0
    skipped = 0

    for txn_data in transactions:
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

    return Response({'synced': synced, 'skipped': skipped})
