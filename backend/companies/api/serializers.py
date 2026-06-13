from rest_framework import serializers
from ..models import Company
# from users.models import User


class CompanySerializer(serializers.ModelSerializer):
        owner_name = serializers.ReadOnlyField(source="owner.username")
        class Meta:
         model = Company
         fields = ["id" , "owner"  , "owner_name", "name" , "description" , "governorate" , "city" , "street" , "phone"]
         read_only_fields=["id","owner" ,"owner_name"]
              

