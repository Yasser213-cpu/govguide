from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.exceptions import NotFound
from ..models import Company, CompanyService
from .serializers import CompanySerializer, CompanyServicesSerializer
from core.permissions import IsCompany, isCompanyServiceOwner
from ..filters import CompanyFilter, CompanyServicesFilter
from rest_framework.pagination import PageNumberPagination


class CompanyAPIView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated(), IsCompany()]

    def get_object(self, id):
        try:
            company = Company.objects.get(pk=id)
            return company
        except Company.DoesNotExist:
            raise NotFound({"detail": "there is no company matches this id"})

    def get(self, request, id=None):
        if id:
            company = self.get_object(id)
            serializer = CompanySerializer(company)
            return Response(serializer.data, status.HTTP_200_OK)

        companies = Company.objects.all()
        company_filter = CompanyFilter(request.GET, queryset=companies)
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(company_filter.qs, request)

        serializer = CompanySerializer(result_page, many=True)

        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status.HTTP_201_CREATED)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        company = self.get_object(id)
        self.check_object_permissions(request, company)
        company.delete()
        return Response(status.HTTP_204_NO_CONTENT)

    def patch(self, request, id):
        company = self.get_object(id)
        self.check_object_permissions(request, company)

        serializer = CompanySerializer(company, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def put(self, request, id):
        company = self.get_object(id)
        self.check_object_permissions(request, company)

        serializer = CompanySerializer(company, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


class CompanyServices(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated(), isCompanyServiceOwner()]

    def get_object(self, id):
        try:
            service = CompanyService.objects.get(pk=id)
            return service
        except CompanyService.DoesNotExist:
            raise NotFound({"detail": "there is no service matches this id"})

    def get(self, request, id=None):
        if id:
            service = self.get_object(id)
            serializer = CompanyServicesSerializer(service)
            return Response(serializer.data, status=status.HTTP_200_OK)
        services = CompanyService.objects.all()
        service_filter = CompanyServicesFilter(request.GET, queryset=services)
        queryset = service_filter.qs
        paginator = PageNumberPagination()
        # paginator.page_size = 5
        result_page = paginator.paginate_queryset(queryset, request)
        serializer = CompanyServicesSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = CompanyServicesSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save(company=request.user.company)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id):
        service = self.get_object(id)
        self.check_object_permissions(request, service)

        serializer = CompanyServicesSerializer(
            service, data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        service = self.get_object(id)
        self.check_object_permissions(request, service)

        serializer = CompanyServicesSerializer(
            service, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        service = self.get_object(id)
        self.check_object_permissions(request, service)
        service.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
