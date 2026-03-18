from django.db import models


CATEGORY_CHOICES = [
    ('labor', 'Labor'),
    ('materials', 'Materials'),
    ('subcontractor', 'Subcontractor'),
    ('equipment', 'Equipment'),
    ('other', 'Other'),
]

STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('completed', 'Completed'),
    ('failed', 'Failed'),
]


class Transaction(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='labor')
    card_last4 = models.CharField(max_length=4, blank=True, default='')
    card_brand = models.CharField(max_length=20, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True)
    customer_phone = models.CharField(max_length=20, blank=True, default='')
    receipt_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"${self.amount} — {self.description or 'No description'} ({self.status})"


class JobTemplate(models.Model):
    name = models.CharField(max_length=100)
    default_category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='labor')
    usage_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-usage_count']

    def __str__(self):
        return self.name
