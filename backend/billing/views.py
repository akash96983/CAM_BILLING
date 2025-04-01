from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Customer, Bill, BillItem
from .serializers import CustomerSerializer, BillSerializer, BillItemSerializer

# Create your views here.

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        bill = serializer.save()
        total = sum(item.total_price for item in bill.items.all())
        bill.total_amount = total
        bill.save()

class BillItemViewSet(viewsets.ModelViewSet):
    queryset = BillItem.objects.all()
    serializer_class = BillItemSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        bill_item = serializer.save()
        bill = bill_item.bill
        bill.total_amount = sum(item.total_price for item in bill.items.all())
        bill.save()
