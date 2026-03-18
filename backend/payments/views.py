import csv
import logging

import stripe
from django.http import HttpResponse
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from twilio.base.exceptions import TwilioRestException

from .models import Transaction, JobTemplate
from .serializers import (
    TransactionReadSerializer,
    PaymentIntentCreateSerializer,
    CompleteTransactionSerializer,
    SendReceiptSerializer,
    OfflineSyncSerializer,
    JobTemplateSerializer,
)
from . import services

logger = logging.getLogger('payments')


class ConnectionTokenView(APIView):
    """Create a Stripe Terminal connection token."""

    def post(self, request):
        try:
            secret = services.create_connection_token()
            return Response({'secret': secret})
        except stripe.StripeError as e:
            logger.error('Stripe connection token error: %s', e)
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)


class PaymentIntentCreateView(APIView):
    """Create a PaymentIntent + pending Transaction."""

    def post(self, request):
        serializer = PaymentIntentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        try:
            intent, _ = services.create_payment(
                amount_cents=data['amount'],
                currency=data['currency'],
                description=data.get('description', ''),
                category=data.get('category', 'labor'),
            )
            return Response({
                'client_secret': intent.client_secret,
                'id': intent.id,
            })
        except stripe.StripeError as e:
            logger.error('Stripe PaymentIntent error: %s', e)
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)


class TransactionCompleteView(APIView):
    """Mark a transaction as completed with card details."""

    def patch(self, request, payment_intent_id):
        serializer = CompleteTransactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            txn = services.complete_transaction(
                payment_intent_id=payment_intent_id,
                card_last4=serializer.validated_data.get('card_last4', ''),
                card_brand=serializer.validated_data.get('card_brand', ''),
            )
            return Response(TransactionReadSerializer(txn).data)
        except Transaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)


class TransactionListView(ListAPIView):
    """List completed transactions with optional filters."""
    serializer_class = TransactionReadSerializer
    pagination_class = None

    def get_queryset(self):
        return services.get_filtered_transactions(
            today=self.request.query_params.get('today') == 'true',
            category=self.request.query_params.get('category'),
        )


class TransactionExportView(APIView):
    """Export transactions as QuickBooks-compatible CSV."""

    def get(self, request):
        qs = services.get_filtered_transactions(
            today=request.query_params.get('today') == 'true',
            category=request.query_params.get('category'),
        )

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="nailit_transactions.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Date', 'Amount', 'Description', 'Category',
            'Card Brand', 'Card Last4', 'Status', 'Stripe Payment Intent ID',
        ])
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


class SendReceiptView(APIView):
    """Send SMS receipt via Twilio."""

    def post(self, request):
        serializer = SendReceiptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        try:
            txn = Transaction.objects.get(stripe_payment_intent_id=data['transaction_id'])
        except Transaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            message_sid = services.send_sms_receipt(txn, data['phone'])
            return Response({'success': True, 'message_sid': message_sid})
        except TwilioRestException as e:
            logger.error('Twilio SMS error: %s', e)
            return Response(
                {'error': f'SMS failed: {str(e)}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class JobTemplateListView(ListAPIView):
    """Return job templates ordered by usage count."""
    queryset = JobTemplate.objects.all()
    serializer_class = JobTemplateSerializer
    pagination_class = None


class RecentDescriptionsView(APIView):
    """Return last 5 unique descriptions from completed transactions."""

    def get(self, request):
        descriptions = (
            Transaction.objects
            .filter(status='completed')
            .exclude(description='')
            .values_list('description', flat=True)
            .distinct()[:5]
        )
        return Response(list(descriptions))


class OfflineSyncView(APIView):
    """Bulk-create/update transactions from offline queue. Idempotent."""

    def post(self, request):
        serializer = OfflineSyncSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        synced, skipped = services.sync_offline_batch(
            serializer.validated_data['transactions']
        )
        return Response({'synced': synced, 'skipped': skipped})
