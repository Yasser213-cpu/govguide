import django_filters
from .models import Company


class CompanyFilter(django_filters.FilterSet):
     city = django_filters.CharFilter(lookup_expr="icontains")
     governorate = django_filters.CharFilter(lookup_expr="icontains")
     name = django_filters.CharFilter(lookup_expr="icontains")
     street = django_filters.CharFilter(lookup_expr="icontains")
     phone = django_filters.CharFilter(lookup_expr="icontains")



     class Meta:
        model = Company
        fields=["name" , "phone" , "governorate" , "city" , "street"]







    # phone_validator = RegexValidator(
    #     regex=r'^\+?\d{7,15}$',
    #     message='Phone number must contain 7 to 15 digits and may start with +.'
    # )




    # owner = models.OneToOneField(User , on_delete=models.CASCADE ,related_name="company")
    # name= models.CharField(max_length=100  ,null=False , blank=False)
    # description = models.TextField(null=False , blank=False)
    # phone = models.CharField(max_length=15, null=False , blank=False ,validators=[phone_validator])
    # governorate = models.CharField(max_length=100 , null=False , blank=False )
    # city = models.CharField(max_length=100 , null=False , blank=False )
    # street = models.CharField(max_length=100 , null=False , blank=False )
    # is_verified = models.BooleanField(default=False)
    # created_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)