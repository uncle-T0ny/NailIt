import re

from rest_framework import serializers
from .models import Transaction, JobTemplate, CATEGORY_CHOICES


class TransactionReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'id', 'amount', 'description', 'category',
            'card_last4', 'card_brand', 'status',
            'stripe_payment_intent_id', 'customer_phone',
            'receipt_sent', 'created_at',
        ]


class PaymentIntentCreateSerializer(serializers.Serializer):
    amount = serializers.IntegerField(min_value=1)
    currency = serializers.CharField(default='cad', max_length=3)
    description = serializers.CharField(default='', allow_blank=True, required=False)
    category = serializers.ChoiceField(choices=CATEGORY_CHOICES, default='labor', required=False)


class CompleteTransactionSerializer(serializers.Serializer):
    card_last4 = serializers.CharField(max_length=4, default='', allow_blank=True, required=False)
    card_brand = serializers.CharField(max_length=20, default='', allow_blank=True, required=False)


class SendReceiptSerializer(serializers.Serializer):
    transaction_id = serializers.CharField(required=True)
    phone = serializers.CharField(required=True)

    def validate_phone(self, value):
        if not re.match(r'^\+?[\d\s\-()]{7,20}$', value):
            raise serializers.ValidationError('Invalid phone number format.')
        return value


class OfflineSyncTransactionSerializer(serializers.Serializer):
    stripe_payment_intent_id = serializers.CharField(required=True)
    amount = serializers.IntegerField(min_value=0, default=0)
    description = serializers.CharField(default='', allow_blank=True, required=False)
    category = serializers.ChoiceField(choices=CATEGORY_CHOICES, default='labor', required=False)
    card_last4 = serializers.CharField(max_length=4, default='', allow_blank=True, required=False)
    card_brand = serializers.CharField(max_length=20, default='', allow_blank=True, required=False)


class OfflineSyncSerializer(serializers.Serializer):
    transactions = OfflineSyncTransactionSerializer(many=True)


class JobTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobTemplate
        fields = ['id', 'name', 'default_category', 'usage_count', 'created_at']
