from django.urls import path
from . import views

urlpatterns = [
    path('connection-token/', views.connection_token),
    path('payment-intents/', views.create_payment_intent),
    # Static transaction routes must come before the dynamic <id> pattern
    path('transactions/export/', views.export_transactions),
    path('transactions/recent-descriptions/', views.recent_descriptions),
    path('transactions/<str:payment_intent_id>/complete/', views.complete_transaction),
    path('transactions/', views.list_transactions),
    path('send-receipt/', views.send_receipt),
    path('job-templates/', views.job_templates),
    path('offline-sync/', views.offline_sync),
]
