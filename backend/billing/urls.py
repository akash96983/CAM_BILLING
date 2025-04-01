from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, BillViewSet, BillItemViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'bills', BillViewSet)
router.register(r'bill-items', BillItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 