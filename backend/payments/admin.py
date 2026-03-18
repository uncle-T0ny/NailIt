from django.contrib import admin
from .models import Transaction, JobTemplate


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['amount', 'description', 'category', 'status', 'card_brand', 'card_last4', 'receipt_sent', 'created_at']
    list_filter = ['status', 'category', 'receipt_sent']
    search_fields = ['description', 'stripe_payment_intent_id']


@admin.register(JobTemplate)
class JobTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'default_category', 'usage_count', 'created_at']
    list_filter = ['default_category']
