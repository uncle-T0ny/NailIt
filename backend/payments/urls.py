from django.urls import path
from . import views

urlpatterns = [
    path('connection-token/', views.connection_token),
    path('payment-intents/', views.create_payment_intent),
    path('transactions/<str:payment_intent_id>/complete/', views.complete_transaction),
    path('transactions/', views.list_transactions),
    path('transactions/export/', views.export_transactions),
    path('send-receipt/', views.send_receipt),
    path('job-templates/', views.job_templates),
    path('transactions/recent-descriptions/', views.recent_descriptions),
    path('offline-sync/', views.offline_sync),
]
