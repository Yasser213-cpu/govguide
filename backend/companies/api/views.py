from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.exceptions import NotFound
from ..models import Company, CompanyService
from .serializers import CompanySerializer, CompanyServicesSerializer
from core.permissions import IsCompany, isCompanyOwner
from ..filters import CompanyFilter, CompanyServicesFilter
from rest_framework.pagination import PageNumberPagination
from reviews.models import Review
from reviews.api.serializer import ReviewSerializer
from django.db.models.functions import Coalesce
from django.db.models import Avg, Value
from core.views import CrudAPIView
import stripe
from django.conf import settings

class CompanyAPIView(CrudAPIView):
    model = Company
    basic_serializer = CompanySerializer
    permission_classes = [IsCompany]
    http_method_names = ["get", "post", "put", "patch"]

    def get_object(self, id):
        try:
            return Company.objects.annotate(
                rating=Coalesce(
                    Avg("services__orders__order_review__rating"),
                    Value(0.0),
                )
            ).get(pk=id)
        except Company.DoesNotExist:
            raise NotFound({"detail": "there is no company matches this id"})

    def get(self, request, id=None):
        if id:
            company = self.get_object(id)
            serializer = CompanySerializer(company)
            return Response(serializer.data, status=status.HTTP_200_OK)

        companies = Company.objects.annotate(
            rating=Coalesce(
                Avg("services__orders__order_review__rating"),
                Value(0.0),
            )
        )

        company_filter = CompanyFilter(request.GET, queryset=companies)
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(company_filter.qs, request)

        serializer = CompanySerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CompanyServices(CrudAPIView):
    model = CompanyService
    basic_serializer = CompanyServicesSerializer
    filter = CompanyServicesFilter
    paginator = PageNumberPagination
    permission_classes = [isCompanyOwner]

    def post(self, request):
        serializer = self.basic_serializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        serializer.save(company=request.user.company)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CompanyServiceDetails(CrudAPIView):
    http_method_names = ["get"]

    def get(self, request, id):
        try:
            company = Company.objects.get(pk=id)
        except Company.DoesNotExist:
            raise NotFound({"detail": "there is no company matches this id"})
        services = CompanyService.objects.filter(company=company)
        serializer = CompanyServicesSerializer(services, many=True)
        return Response(serializer.data)


class CompanyReviewsAPIView(CrudAPIView):
    http_method_names = ["get"]

    def get(self, request, id):
        try:
            company = Company.objects.get(pk=id)
        except Company.DoesNotExist:
            raise NotFound({"detail": "there is no company matches this id"})
        reviews = Review.objects.filter(order__service__company=company)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)


class CompanyStripeOnboardingAPIView(APIView):
    permission_classes = [IsAuthenticated, isCompanyOwner]

    def post(self, request):
        company = request.user.company  

        
        if not company.stripe_account_id:
            account = stripe.Account.create(
                type="express",
                country="us",
                email=request.user.email,
                capabilities={
                    "card_payments": {"requested": True},
                    "transfers": {"requested": True},
                },
            )
            company.stripe_account_id = account.id
            company.save(update_fields=["stripe_account_id"])

        
        account_link = stripe.AccountLink.create(
            account=company.stripe_account_id,
            refresh_url=f"{settings.FRONTEND_URL}/company/settings?stripe=refresh",
            return_url=f"{settings.FRONTEND_URL}/company/settings?stripe=complete",
            type="account_onboarding",
        )

        return Response({"onboarding_url": account_link.url})

class CompanyStripeStatusAPIView(APIView):
    permission_classes = [IsAuthenticated, isCompanyOwner]

    def get(self, request):
        company = request.user.company
        return Response({
            "connected": bool(company.stripe_account_id),
            "onboarding_complete": company.stripe_onboarding_complete,
        })

class CompanyBalanceAPIView(APIView):
    permission_classes = [IsAuthenticated, isCompanyOwner]

    def get(self, request):
        company = request.user.company
        return Response({"balance": company.balance})