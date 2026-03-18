from decimal import Decimal
from unittest.mock import patch, MagicMock

import stripe
from django.test import TestCase, override_settings
from rest_framework.test import APITestCase, APIClient
from twilio.base.exceptions import TwilioRestException

from .models import Transaction, JobTemplate
from .serializers import (
    PaymentIntentCreateSerializer,
    CompleteTransactionSerializer,
    SendReceiptSerializer,
    OfflineSyncSerializer,
)
from . import services


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class TransactionModelTests(TestCase):

    def test_create_transaction(self):
        txn = Transaction.objects.create(
            amount=Decimal('10.00'),
            description='Test job',
            category='labor',
            status='pending',
            stripe_payment_intent_id='pi_test_123',
        )
        self.assertEqual(txn.amount, Decimal('10.00'))
        self.assertEqual(txn.status, 'pending')

    def test_str(self):
        txn = Transaction(amount=Decimal('25.50'), description='Framing', status='completed')
        self.assertEqual(str(txn), '$25.50 — Framing (completed)')

    def test_str_no_description(self):
        txn = Transaction(amount=Decimal('10.00'), status='pending')
        self.assertEqual(str(txn), '$10.00 — No description (pending)')

    def test_from_cents(self):
        txn = Transaction.from_cents(
            amount_cents=1050,
            description='Test',
            category='labor',
            status='pending',
            stripe_payment_intent_id='pi_test_cents',
        )
        self.assertEqual(txn.amount, Decimal('10.50'))

    def test_amount_dollars_property(self):
        txn = Transaction(amount=Decimal('99.99'))
        self.assertEqual(txn.amount_dollars, '$99.99')

    def test_ordering(self):
        Transaction.objects.create(
            amount=Decimal('1.00'), stripe_payment_intent_id='pi_first', status='completed',
        )
        Transaction.objects.create(
            amount=Decimal('2.00'), stripe_payment_intent_id='pi_second', status='completed',
        )
        txns = list(Transaction.objects.all())
        # Most recent first
        self.assertEqual(txns[0].stripe_payment_intent_id, 'pi_second')


class JobTemplateModelTests(TestCase):

    def test_str(self):
        t = JobTemplate(name='Framing')
        self.assertEqual(str(t), 'Framing')


# ---------------------------------------------------------------------------
# Serializer tests
# ---------------------------------------------------------------------------

class PaymentIntentCreateSerializerTests(TestCase):

    def test_valid(self):
        s = PaymentIntentCreateSerializer(data={'amount': 1000})
        self.assertTrue(s.is_valid())
        self.assertEqual(s.validated_data['amount'], 1000)
        self.assertEqual(s.validated_data['currency'], 'cad')

    def test_zero_amount(self):
        s = PaymentIntentCreateSerializer(data={'amount': 0})
        self.assertFalse(s.is_valid())

    def test_negative_amount(self):
        s = PaymentIntentCreateSerializer(data={'amount': -5})
        self.assertFalse(s.is_valid())

    def test_missing_amount(self):
        s = PaymentIntentCreateSerializer(data={})
        self.assertFalse(s.is_valid())

    def test_invalid_category(self):
        s = PaymentIntentCreateSerializer(data={'amount': 100, 'category': 'invalid'})
        self.assertFalse(s.is_valid())

    def test_valid_category(self):
        s = PaymentIntentCreateSerializer(data={'amount': 100, 'category': 'materials'})
        self.assertTrue(s.is_valid())


class SendReceiptSerializerTests(TestCase):

    def test_valid(self):
        s = SendReceiptSerializer(data={'transaction_id': 'pi_123', 'phone': '+14155551234'})
        self.assertTrue(s.is_valid())

    def test_missing_phone(self):
        s = SendReceiptSerializer(data={'transaction_id': 'pi_123'})
        self.assertFalse(s.is_valid())

    def test_missing_transaction_id(self):
        s = SendReceiptSerializer(data={'phone': '+14155551234'})
        self.assertFalse(s.is_valid())

    def test_invalid_phone(self):
        s = SendReceiptSerializer(data={'transaction_id': 'pi_123', 'phone': 'not-a-phone!!'})
        self.assertFalse(s.is_valid())


class OfflineSyncSerializerTests(TestCase):

    def test_valid(self):
        s = OfflineSyncSerializer(data={
            'transactions': [
                {'stripe_payment_intent_id': 'pi_1', 'amount': 500},
                {'stripe_payment_intent_id': 'pi_2', 'amount': 1000, 'category': 'materials'},
            ]
        })
        self.assertTrue(s.is_valid())

    def test_missing_pi_id(self):
        s = OfflineSyncSerializer(data={
            'transactions': [{'amount': 500}]
        })
        self.assertFalse(s.is_valid())


# ---------------------------------------------------------------------------
# Service tests
# ---------------------------------------------------------------------------

class ServiceTests(TestCase):

    @patch('payments.services.stripe.terminal.ConnectionToken.create')
    def test_create_connection_token(self, mock_create):
        mock_create.return_value = MagicMock(secret='tok_secret_123')
        secret = services.create_connection_token()
        self.assertEqual(secret, 'tok_secret_123')
        mock_create.assert_called_once()

    @patch('payments.services.stripe.PaymentIntent.create')
    def test_create_payment(self, mock_create):
        mock_create.return_value = MagicMock(
            id='pi_test_svc',
            client_secret='cs_test',
        )
        intent, txn = services.create_payment(1500, 'cad', 'Framing job', 'labor')
        self.assertEqual(intent.id, 'pi_test_svc')
        self.assertEqual(txn.amount, Decimal('15.00'))
        self.assertEqual(txn.status, 'pending')
        self.assertTrue(Transaction.objects.filter(stripe_payment_intent_id='pi_test_svc').exists())

    def test_complete_transaction(self):
        Transaction.objects.create(
            amount=Decimal('10.00'),
            stripe_payment_intent_id='pi_complete_test',
            status='pending',
        )
        txn = services.complete_transaction('pi_complete_test', '4242', 'visa')
        self.assertEqual(txn.status, 'completed')
        self.assertEqual(txn.card_last4, '4242')
        self.assertEqual(txn.card_brand, 'visa')

    def test_complete_transaction_not_found(self):
        with self.assertRaises(Transaction.DoesNotExist):
            services.complete_transaction('pi_nonexistent')

    def test_get_filtered_transactions(self):
        Transaction.objects.create(
            amount=Decimal('10.00'), stripe_payment_intent_id='pi_f1',
            status='completed', category='labor',
        )
        Transaction.objects.create(
            amount=Decimal('20.00'), stripe_payment_intent_id='pi_f2',
            status='completed', category='materials',
        )
        Transaction.objects.create(
            amount=Decimal('5.00'), stripe_payment_intent_id='pi_f3',
            status='pending', category='labor',
        )

        # All completed
        qs = services.get_filtered_transactions()
        self.assertEqual(qs.count(), 2)

        # Filter by category
        qs = services.get_filtered_transactions(category='labor')
        self.assertEqual(qs.count(), 1)

        # Filter by today
        qs = services.get_filtered_transactions(today=True)
        self.assertEqual(qs.count(), 2)  # both created today

    @patch('payments.services.TwilioClient')
    def test_send_sms_receipt(self, mock_twilio_cls):
        mock_client = MagicMock()
        mock_client.messages.create.return_value = MagicMock(sid='SM_test_123')
        mock_twilio_cls.return_value = mock_client

        txn = Transaction.objects.create(
            amount=Decimal('25.00'),
            description='Roofing',
            card_last4='1234',
            card_brand='visa',
            stripe_payment_intent_id='pi_receipt_test',
            status='completed',
        )
        sid = services.send_sms_receipt(txn, '+14155551234')
        self.assertEqual(sid, 'SM_test_123')

        txn.refresh_from_db()
        self.assertTrue(txn.receipt_sent)
        self.assertEqual(txn.customer_phone, '+14155551234')

    def test_sync_offline_batch(self):
        synced, skipped = services.sync_offline_batch([
            {
                'stripe_payment_intent_id': 'pi_sync_1',
                'amount': 1000,
                'description': 'Job 1',
                'category': 'labor',
                'card_last4': '4242',
                'card_brand': 'visa',
            },
            {
                'stripe_payment_intent_id': 'pi_sync_2',
                'amount': 2000,
            },
        ])
        self.assertEqual(synced, 2)
        self.assertEqual(skipped, 0)
        self.assertEqual(Transaction.objects.count(), 2)

    def test_sync_offline_batch_idempotent(self):
        Transaction.objects.create(
            amount=Decimal('10.00'),
            stripe_payment_intent_id='pi_existing',
            status='completed',
        )
        synced, skipped = services.sync_offline_batch([
            {'stripe_payment_intent_id': 'pi_existing', 'amount': 1000},
        ])
        self.assertEqual(synced, 0)
        self.assertEqual(skipped, 1)
        self.assertEqual(Transaction.objects.count(), 1)


# ---------------------------------------------------------------------------
# View / integration tests
# ---------------------------------------------------------------------------

class ConnectionTokenViewTests(APITestCase):

    @patch('payments.services.stripe.terminal.ConnectionToken.create')
    def test_success(self, mock_create):
        mock_create.return_value = MagicMock(secret='tok_abc')
        resp = self.client.post('/api/connection-token/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['secret'], 'tok_abc')

    @patch('payments.services.stripe.terminal.ConnectionToken.create')
    def test_stripe_error(self, mock_create):
        mock_create.side_effect = stripe.StripeError('Stripe down')
        resp = self.client.post('/api/connection-token/')
        self.assertEqual(resp.status_code, 502)
        self.assertIn('error', resp.data)


class PaymentIntentViewTests(APITestCase):

    @patch('payments.services.stripe.PaymentIntent.create')
    def test_success(self, mock_create):
        mock_create.return_value = MagicMock(id='pi_new', client_secret='cs_new')
        resp = self.client.post('/api/payment-intents/', {
            'amount': 2500,
            'currency': 'cad',
            'description': 'Framing',
            'category': 'labor',
        })
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['id'], 'pi_new')
        self.assertEqual(resp.data['client_secret'], 'cs_new')
        self.assertTrue(Transaction.objects.filter(stripe_payment_intent_id='pi_new').exists())

    def test_invalid_amount(self):
        resp = self.client.post('/api/payment-intents/', {'amount': -1})
        self.assertEqual(resp.status_code, 400)

    def test_missing_amount(self):
        resp = self.client.post('/api/payment-intents/', {})
        self.assertEqual(resp.status_code, 400)

    def test_invalid_category(self):
        resp = self.client.post('/api/payment-intents/', {'amount': 100, 'category': 'bogus'})
        self.assertEqual(resp.status_code, 400)

    @patch('payments.services.stripe.PaymentIntent.create')
    def test_stripe_error(self, mock_create):
        mock_create.side_effect = stripe.StripeError('Card declined')
        resp = self.client.post('/api/payment-intents/', {'amount': 1000})
        self.assertEqual(resp.status_code, 502)


class TransactionCompleteViewTests(APITestCase):

    def setUp(self):
        self.txn = Transaction.objects.create(
            amount=Decimal('10.00'),
            stripe_payment_intent_id='pi_complete_view',
            status='pending',
        )

    def test_success(self):
        resp = self.client.patch(
            '/api/transactions/pi_complete_view/complete/',
            {'card_last4': '4242', 'card_brand': 'visa'},
            format='json',
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['status'], 'completed')
        self.assertEqual(resp.data['card_last4'], '4242')

    def test_not_found(self):
        resp = self.client.patch(
            '/api/transactions/pi_nonexistent/complete/',
            {'card_last4': '0000'},
            format='json',
        )
        self.assertEqual(resp.status_code, 404)


class TransactionListViewTests(APITestCase):

    def setUp(self):
        for i in range(3):
            Transaction.objects.create(
                amount=Decimal('10.00'),
                stripe_payment_intent_id=f'pi_list_{i}',
                status='completed',
                category='labor',
            )
        Transaction.objects.create(
            amount=Decimal('5.00'),
            stripe_payment_intent_id='pi_pending',
            status='pending',
        )

    def test_list_completed_only(self):
        resp = self.client.get('/api/transactions/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 3)

    def test_filter_category(self):
        Transaction.objects.create(
            amount=Decimal('20.00'),
            stripe_payment_intent_id='pi_mat',
            status='completed',
            category='materials',
        )
        resp = self.client.get('/api/transactions/?category=materials')
        self.assertEqual(len(resp.data), 1)

    def test_filter_today(self):
        resp = self.client.get('/api/transactions/?today=true')
        self.assertEqual(len(resp.data), 3)

    def test_returns_flat_array(self):
        resp = self.client.get('/api/transactions/')
        self.assertIsInstance(resp.data, list)


class TransactionExportViewTests(APITestCase):

    def setUp(self):
        Transaction.objects.create(
            amount=Decimal('15.50'),
            description='Electrical work',
            stripe_payment_intent_id='pi_csv_1',
            status='completed',
            category='labor',
            card_brand='visa',
            card_last4='4242',
        )

    def test_csv_format(self):
        resp = self.client.get('/api/transactions/export/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'text/csv')
        content = resp.content.decode()
        lines = content.strip().split('\n')
        self.assertEqual(len(lines), 2)  # header + 1 row
        self.assertIn('Date', lines[0])
        self.assertIn('15.50', lines[1])
        self.assertIn('Electrical work', lines[1])


class SendReceiptViewTests(APITestCase):

    def setUp(self):
        self.txn = Transaction.objects.create(
            amount=Decimal('25.00'),
            description='Plumbing',
            stripe_payment_intent_id='pi_receipt_view',
            status='completed',
            card_last4='1234',
            card_brand='mastercard',
        )

    @patch('payments.services.TwilioClient')
    def test_success(self, mock_twilio_cls):
        mock_client = MagicMock()
        mock_client.messages.create.return_value = MagicMock(sid='SM_view_123')
        mock_twilio_cls.return_value = mock_client

        resp = self.client.post('/api/send-receipt/', {
            'transaction_id': 'pi_receipt_view',
            'phone': '+14155551234',
        })
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])

    def test_missing_fields(self):
        resp = self.client.post('/api/send-receipt/', {})
        self.assertEqual(resp.status_code, 400)

    def test_transaction_not_found(self):
        resp = self.client.post('/api/send-receipt/', {
            'transaction_id': 'pi_nonexistent',
            'phone': '+14155551234',
        })
        self.assertEqual(resp.status_code, 404)

    @patch('payments.services.TwilioClient')
    def test_twilio_error(self, mock_twilio_cls):
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = TwilioRestException(
            status=400, uri='/test', msg='Bad number',
        )
        mock_twilio_cls.return_value = mock_client

        resp = self.client.post('/api/send-receipt/', {
            'transaction_id': 'pi_receipt_view',
            'phone': '+14155551234',
        })
        self.assertEqual(resp.status_code, 502)


class JobTemplateListViewTests(APITestCase):

    def setUp(self):
        JobTemplate.objects.create(name='Framing', default_category='labor', usage_count=5)
        JobTemplate.objects.create(name='Concrete', default_category='materials', usage_count=2)

    def test_list(self):
        resp = self.client.get('/api/job-templates/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 2)
        # Ordered by usage_count descending
        self.assertEqual(resp.data[0]['name'], 'Framing')

    def test_no_pagination(self):
        resp = self.client.get('/api/job-templates/')
        # Should be a flat list, not paginated
        self.assertIsInstance(resp.data, list)


class RecentDescriptionsViewTests(APITestCase):

    def setUp(self):
        for desc in ['Framing', 'Drywall', 'Electrical', 'Plumbing', 'Roofing', 'Painting']:
            Transaction.objects.create(
                amount=Decimal('10.00'),
                description=desc,
                stripe_payment_intent_id=f'pi_desc_{desc}',
                status='completed',
            )
        # One with blank description — should be excluded
        Transaction.objects.create(
            amount=Decimal('5.00'),
            stripe_payment_intent_id='pi_desc_blank',
            status='completed',
            description='',
        )

    def test_returns_max_5(self):
        resp = self.client.get('/api/transactions/recent-descriptions/')
        self.assertEqual(resp.status_code, 200)
        self.assertLessEqual(len(resp.data), 5)

    def test_excludes_blank(self):
        resp = self.client.get('/api/transactions/recent-descriptions/')
        self.assertNotIn('', resp.data)


class OfflineSyncViewTests(APITestCase):

    def test_sync(self):
        resp = self.client.post('/api/offline-sync/', {
            'transactions': [
                {
                    'stripe_payment_intent_id': 'pi_offline_1',
                    'amount': 1500,
                    'description': 'Job 1',
                    'category': 'labor',
                    'card_last4': '4242',
                    'card_brand': 'visa',
                },
            ]
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['synced'], 1)
        self.assertEqual(resp.data['skipped'], 0)

    def test_idempotent(self):
        Transaction.objects.create(
            amount=Decimal('15.00'),
            stripe_payment_intent_id='pi_offline_dup',
            status='completed',
        )
        resp = self.client.post('/api/offline-sync/', {
            'transactions': [
                {'stripe_payment_intent_id': 'pi_offline_dup', 'amount': 1500},
            ]
        }, format='json')
        self.assertEqual(resp.data['synced'], 0)
        self.assertEqual(resp.data['skipped'], 1)

    def test_invalid_payload(self):
        resp = self.client.post('/api/offline-sync/', {}, format='json')
        self.assertEqual(resp.status_code, 400)
