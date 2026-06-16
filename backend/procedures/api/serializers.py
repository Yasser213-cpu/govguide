from rest_framework import serializers
from ..models import Procedure


class ProcedureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedure
        fields = ["id" , "name" , "description" , "estimated_government_fee" , "estimated_processing_days" , "government_authority"]
        read_only_fields=["id"]
