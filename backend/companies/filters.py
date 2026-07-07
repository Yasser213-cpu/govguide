import django_filters
from .models import Company, CompanyService


class CompanyFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(lookup_expr="icontains")
    governorate = django_filters.CharFilter(lookup_expr="icontains")
    name = django_filters.CharFilter(lookup_expr="icontains")
    street = django_filters.CharFilter(lookup_expr="icontains")
    phone = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = Company
        fields = ["name", "phone", "governorate", "city", "street"]


class CompanyServicesFilter(django_filters.FilterSet):
    procedure = django_filters.CharFilter(
        field_name="procedure__name", lookup_expr="icontains"
    )
    company = django_filters.NumberFilter(
        field_name="company__id", lookup_expr="exact"
    )
    price_min = django_filters.NumberFilter(
        field_name="company_service_fee", lookup_expr="gte"
    )
    price_max = django_filters.NumberFilter(
        field_name="company_service_fee", lookup_expr="lte"
    )
    days_min = django_filters.NumberFilter(
        field_name="estimated_completion_days", lookup_expr="gte"
    )
    days_max = django_filters.NumberFilter(
        field_name="estimated_completion_days", lookup_expr="lte"
    )
    is_available = django_filters.BooleanFilter(
        field_name="is_available", lookup_expr="exact"
    )

    class Meta:
        model = CompanyService
        fields = [
            "company",
            "price_min",
            "price_max",
            "days_min",
            "days_max",
            "is_available",
        ]


# class CompanyService(models.Model):
#     company = models.ForeignKey(
#         Company, on_delete=models.CASCADE, related_name="services"
#     )
#     procedure = models.ForeignKey(
#         Procedure, on_delete=models.CASCADE, related_name="company_offerings"
#     )

#     company_service_fee = models.DecimalField(
#         max_digits=10, decimal_places=2, validators=[MinValueValidator(0.00)]
#     )
#     estimated_completion_days = models.PositiveIntegerField()
#     is_available = models.BooleanField(default=True)

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ("company", "procedure")
#         ordering = ["company_service_fee"]

#     def __str__(self):
#         return f"{self.company.name} - {self.procedure.name}"
