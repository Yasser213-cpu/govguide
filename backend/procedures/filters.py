import django_filters
from .models import Procedure


class ProcedureFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr="icontains")
    description = django_filters.CharFilter(lookup_expr="icontains")
    government_authority = django_filters.CharFilter(lookup_expr="icontains")
    min_fee = django_filters.NumberFilter(
        field_name="estimated_government_fee", lookup_expr="gte"
    )
    max_fee = django_filters.NumberFilter(
        field_name="estimated_government_fee", lookup_expr="lte"
    )
    max_days = django_filters.NumberFilter(
        field_name="estimated_processing_days", lookup_expr="lte"
    )

    class Meta:
        model = Procedure
        fields = [
            "name",
            "description",
            "government_authority",
            "estimated_government_fee",
            "estimated_processing_days",
        ]
