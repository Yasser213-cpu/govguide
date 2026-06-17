from rest_framework import serializers
from ..models import Company, CompanyService
from procedures.api.serializers import (
    ProcedureSerializer,
)  # To show full procedure details on GET
from rest_framework.exceptions import ValidationError


class CompanyServicesSerializer(serializers.ModelSerializer):
    company_offerings = ProcedureSerializer(source="procedure", read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = CompanyService
        fields = [
            "id",
            "company",
            "company_name",
            "procedure",
            "company_service_fee",
            "estimated_completion_days",
            "is_available",
            "company_offerings",
        ]
        read_only_fields = ["id", "company_name", "company_offerings", "company"]

    def validate(self, attrs):
        request = self.context.get("request")
        if request.method == "POST":
            company = request.user.company
            procedure = attrs["procedure"]
            if CompanyService.objects.filter(
                company=company, procedure=procedure
            ).exists():
                raise ValidationError({"message": "this service already exist"})

        return super().validate(attrs)


class CompanySerializer(serializers.ModelSerializer):
    company_services = CompanyServicesSerializer(
        source="services",
        read_only=True,
        many=True,
    )

    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "description",
            "phone",
            "governorate",
            "city",
            "street",
            "company_services",
        ]
