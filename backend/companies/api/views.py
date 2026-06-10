from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny , IsAuthenticated
from rest_framework import status
from rest_framework.exceptions import NotFound
from ..models import Company
from .serializers import CompanySerializer



class CompanyAPIView(APIView):
    
    def get_object(self, id):
        try:
            company = Company.objects.get(pk=id)
            return company
        except Company.DoesNotExist:
            raise NotFound({"error":"there is no company matches this id"})
        

    def get(self, request, id=None):
        if id:
            company = self.get_object(id)
            serializer = CompanySerializer(company)
            return Response(serializer.data, status.HTTP_200_OK)

        companies = Company.objects.all()
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data, status.HTTP_200_OK)
    


    def post(self ,request):
        serializer =  CompanySerializer(data= request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data , status.HTTP_201_CREATED)
        return Response(serializer.errors , status.HTTP_400_BAD_REQUEST)
    


    def delete(self,request , id):
       company = self.get_object(id)
       company.delete()
       return Response(status.HTTP_204_NO_CONTENT)
    


    def patch(self, request, id):
      company = self.get_object(id)
      serializer = CompanySerializer(
        company,
        data=request.data,
        partial=True  
    )

      if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

      return Response(serializer.errors, status=400)
    


    def put(self, request, id):
        company = self.get_object(id)

        serializer = CompanySerializer(
        company,
        data=request.data ,
        partial=True
    )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
    



        

