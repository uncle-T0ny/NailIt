from django.urls import path
from . import views

urlpatterns = [
    path('connection-token/', views.ConnectionTokenView.as_view()),
    path('payment-intents/', views.PaymentIntentCreateView.as_view()),
    # Static transaction routes must come before the dynamic <id> pattern
    path('transactions/export/', views.TransactionExportView.as_view()),
    path('transactions/recent-descriptions/', views.RecentDescriptionsView.as_view()),
    path('transactions/<str:payment_intent_id>/complete/', views.TransactionCompleteView.as_view()),
    path('transactions/', views.TransactionListView.as_view()),
    path('send-receipt/', views.SendReceiptView.as_view()),
    path('job-templates/', views.JobTemplateListView.as_view()),
    path('offline-sync/', views.OfflineSyncView.as_view()),
]
