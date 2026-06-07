from rest_framework.views import APIView
from .serilizers import RegistrationSerializer
from rest_framework_simplejwt.views import token_obtain_pair
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken




class RegisterAPIView (APIView):
    def post(self ,request):
        serializer =  RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = RefreshToken.for_user(user)
            return Response({"refresh": str(token) , "access":str(token.access_token)} ,status.HTTP_201_CREATED)
        return Response(serializer.errors , status.HTTP_400_BAD_REQUEST)
